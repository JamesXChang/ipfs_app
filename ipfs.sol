pragma solidity ^0.5.8;

contract Contract { 
    string ipfsHash;  
    
    function setHash(string memory x) public {   
        ipfsHash = x; 
    } 
    
    function getHash() public view returns (string memory x) {
        return ipfsHash; 
    }
}