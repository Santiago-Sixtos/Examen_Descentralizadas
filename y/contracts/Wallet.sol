// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MultiSignPaymentWallet {
    // ================================
    // STRUCTS Y VARIABLES EXISTENTES
    // ================================
    struct Transaction {
        address to;
        uint256 amount;
        bool executed;
        uint256 approvals;
        mapping(address => bool) approvedBy;
        Approval[] approvalList;
    }

    struct Approval {
        address approver;
        uint256 timestamp;
    }

    address[] public owners;
    mapping(address => bool) public isOwner;
    uint256 public requiredApprovals;

    uint256 public transactionCount;
    mapping(uint256 => Transaction) public transactions;

    address[] public payees;
    mapping(address => uint256) public shares;
    uint256 public totalShares;

    // ================================
    // VARIABLES DE PRODUCTOS
    // ================================
    struct Product {
        uint id;
        string name;
        uint price;
        address seller;
        bool active;
    }

    uint public nextProductId;
    mapping(uint => Product) public products;
    mapping(address => uint[]) public purchases;

    bool private locked; // para evitar reentrancy manualmente

    // ================================
    // EVENTOS
    // ================================
    event Deposit(address indexed sender, uint256 amount);
    event SubmitTransaction(uint256 indexed txId, address indexed to, uint256 amount);
    event ApproveTransaction(address indexed owner, uint256 indexed txId);
    event ExecuteTransaction(uint256 indexed txId);
    event PaymentReleased(address indexed to, uint256 amount);
    event ProductAdded(uint id, string name, uint price, address seller);
    event ProductPurchased(uint id, address buyer, uint price);

    // ================================
    // MODIFICADORES
    // ================================
    modifier onlyOwner() {
        require(isOwner[msg.sender], "No eres un owner");
        _;
    }

    modifier nonReentrant() {
        require(!locked, "No reentrante");
        locked = true;
        _;
        locked = false;
    }

    // ================================
    // CONSTRUCTOR
    // ================================
    constructor(
        address[] memory _owners,
        uint256 _requiredApprovals,
        address[] memory _payees,
        uint256[] memory _shares
    ) {
        require(_owners.length > 0, "Debe haber al menos un owner");
        require(
            _requiredApprovals > 0 && _requiredApprovals <= _owners.length,
            "Aprobaciones invalidas"
        );
        require(_payees.length == _shares.length, "Payees y shares deben tener la misma longitud");

        for (uint256 i = 0; i < _owners.length; i++) {
            address owner = _owners[i];
            require(owner != address(0), "Owner no valido");
            require(!isOwner[owner], "Owner duplicado");
            isOwner[owner] = true;
            owners.push(owner);
        }

        requiredApprovals = _requiredApprovals;

        for (uint256 i = 0; i < _payees.length; i++) {
            payees.push(_payees[i]);
            shares[_payees[i]] = _shares[i];
            totalShares += _shares[i];
        }
    }

    // ================================
    // FUNCIONES EXISTENTES
    // ================================
    receive() external payable {
        emit Deposit(msg.sender, msg.value);
    }

    function submitTransaction(address _to, uint256 _amount)
        external
        onlyOwner
        returns (uint256)
    {
        require(_to != address(0), "Direccion invalida");
        require(address(this).balance >= _amount, "Fondos insuficientes");

        uint256 txId = transactionCount;
        Transaction storage txn = transactions[txId];
        txn.to = _to;
        txn.amount = _amount;
        txn.executed = false;
        txn.approvals = 0;
        transactionCount++;

        emit SubmitTransaction(txId, _to, _amount);
        return txId;
    }

    function approveTransaction(uint256 _txId) external onlyOwner {
        Transaction storage txn = transactions[_txId];
        require(!txn.executed, "Ya ejecutada");
        require(!txn.approvedBy[msg.sender], "Ya aprobaste");

        txn.approvedBy[msg.sender] = true;
        txn.approvals++;

        txn.approvalList.push(Approval({
            approver: msg.sender,
            timestamp: block.timestamp
        }));

        emit ApproveTransaction(msg.sender, _txId);
    }

    function getTransactionApprovals(uint256 _txId)
        external
        view
        returns (address[] memory approvers, uint256[] memory timestamps)
    {
        Transaction storage txn = transactions[_txId];
        uint256 len = txn.approvalList.length;

        approvers = new address[](len);
        timestamps = new uint256[](len);

        for (uint256 i = 0; i < len; i++) {
            Approval storage a = txn.approvalList[i];
            approvers[i] = a.approver;
            timestamps[i] = a.timestamp;
        }
    }

    function executeTransaction(uint256 _txId) external onlyOwner {
        Transaction storage txn = transactions[_txId];
        require(!txn.executed, "Ya ejecutada");
        require(txn.approvals >= requiredApprovals, "No tiene suficientes aprobaciones");
        require(address(this).balance >= txn.amount, "Fondos insuficientes");

        txn.executed = true;
        payable(txn.to).transfer(txn.amount);

        emit ExecuteTransaction(_txId);
    }

    function releasePayments() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "Sin balance");

        for (uint256 i = 0; i < payees.length; i++) {
            address payee = payees[i];
            uint256 payment = (balance * shares[payee]) / totalShares;
            payable(payee).transfer(payment);
            emit PaymentReleased(payee, payment);
        }
    }

    function getOwners() external view returns (address[] memory) {
        return owners;
    }

    function getPayees() external view returns (address[] memory, uint256[] memory) {
        uint256[] memory sharesList = new uint256[](payees.length);
        for (uint256 i = 0; i < payees.length; i++) {
            sharesList[i] = shares[payees[i]];
        }
        return (payees, sharesList);
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    // ================================
    // FUNCIONES DE PRODUCTOS
    // ================================
    function addProduct(string memory _name, uint _price) external onlyOwner {
        require(_price > 0, "El precio debe ser mayor a 0");
        uint productId = nextProductId++;
        products[productId] = Product({
            id: productId,
            name: _name,
            price: _price,
            seller: msg.sender,
            active: true
        });
        emit ProductAdded(productId, _name, _price, msg.sender);
    }

    function buyProduct(uint _productId) external payable nonReentrant {
        Product storage product = products[_productId];
        require(product.active, "Producto no disponible");
        require(msg.value == product.price, "Monto incorrecto");

        emit Deposit(msg.sender, msg.value);

        purchases[msg.sender].push(_productId);
        emit ProductPurchased(_productId, msg.sender, product.price);
    }

    function disableProduct(uint _productId) external onlyOwner {
        products[_productId].active = false;
    }

    function getAllProducts() external view returns (Product[] memory) {
        Product[] memory all = new Product[](nextProductId);
        for (uint i = 0; i < nextProductId; i++) {
            all[i] = products[i];
        }
        return all;
    }
}
