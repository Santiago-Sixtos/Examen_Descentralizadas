// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;
 
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
 
contract NFTClase is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
 
    using Strings for uint256;
    mapping(uint256 => string) private _tokenURIs;
 
    string private _baseURIextended;
 
    constructor() ERC721("NFTClase", "NFTC") {}
 
    /// @notice Define la base URI para los metadatos
    function setBaseURI(string memory baseUri) external onlyOwner {
        _baseURIextended = baseUri;
    }
 
    /// @notice Sobrescribe la función interna de ERC721 para devolver la base URI
    function _baseURI() internal view virtual override returns (string memory) {
        return _baseURIextended;
    }
 
    /// @notice Define el tokenURI de un NFT específico
    function _setTokenURI(uint256 tokenId, string memory _tokenURI) internal virtual {
        require(_exists(tokenId), "ERC721Metadata: URI set of nonexistent token");
        _tokenURIs[tokenId] = _tokenURI;
    }
 
    /// @notice Devuelve el tokenURI de un NFT
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
 
        string memory _tokenURI = _tokenURIs[tokenId];
        string memory base = _baseURI();
 
        // Si no hay baseURI, devuelve el tokenURI directamente
        if (bytes(base).length == 0) {
            return _tokenURI;
        }
        // Si hay baseURI y tokenURI, concatenamos
        if (bytes(_tokenURI).length > 0) {
            return string(abi.encodePacked(base, _tokenURI));
        }
        // Si no tiene tokenURI definido, se usa el ID
        return string(abi.encodePacked(base, tokenId.toString()));
    }
 
    /// @notice Función para mintear un nuevo NFT
    /// @param recipient Dirección que recibirá el NFT
    /// @param _tokenURI URI de los metadatos del NFT
    function mintNFT(address recipient, string memory _tokenURI) public onlyOwner returns (uint256) {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _safeMint(recipient, newItemId);
        _setTokenURI(newItemId, _tokenURI);
        return newItemId;
    }
}