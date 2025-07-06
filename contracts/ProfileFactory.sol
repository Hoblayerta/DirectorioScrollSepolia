// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ProfileContract
 * @dev Contrato individual para cada perfil profesional
 */
contract ProfileContract is Ownable, ReentrancyGuard {
    struct PrivateInfo {
        string encryptedPhone;
        string encryptedWhatsapp;
        string encryptedEmail;
        string encryptedCV;
        uint256 timestamp;
    }
    
    struct PublicInfo {
        string name;
        string title;
        string company;
        string experience;
        string linkedin;
        string twitter;
        string github;
        string website;
    }
    
    PublicInfo public publicInfo;
    PrivateInfo private privateInfo;
    uint256 public accessPrice;
    
    mapping(address => bool) public hasAccess;
    mapping(address => uint256) public accessTimestamp;
    address[] public accessList;
    
    event AccessGranted(address indexed user, uint256 amount, uint256 timestamp);
    event PrivateInfoUpdated(uint256 timestamp);
    event PublicInfoUpdated(uint256 timestamp);
    
    constructor(
        address _owner,
        uint256 _accessPrice,
        PublicInfo memory _publicInfo
    ) Ownable(_owner) {
        accessPrice = _accessPrice;
        publicInfo = _publicInfo;
    }
    
    function updatePublicInfo(PublicInfo memory _publicInfo) external onlyOwner {
        publicInfo = _publicInfo;
        emit PublicInfoUpdated(block.timestamp);
    }
    
    function updatePrivateInfo(PrivateInfo memory _privateInfo) external onlyOwner {
        privateInfo = _privateInfo;
        emit PrivateInfoUpdated(block.timestamp);
    }
    
    function payForAccess() external payable nonReentrant {
        require(msg.value >= accessPrice, "Insufficient payment");
        require(!hasAccess[msg.sender], "Already has access");
        
        hasAccess[msg.sender] = true;
        accessTimestamp[msg.sender] = block.timestamp;
        accessList.push(msg.sender);
        
        (bool success, ) = owner().call{value: msg.value}("");
        require(success, "Transfer failed");
        
        emit AccessGranted(msg.sender, msg.value, block.timestamp);
    }
    
    function getPrivateInfo() external view returns (PrivateInfo memory) {
        require(hasAccess[msg.sender] || msg.sender == owner(), "Access denied");
        return privateInfo;
    }
    
    function getAccessCount() external view returns (uint256) {
        return accessList.length;
    }
    
    function getAccessList() external view onlyOwner returns (address[] memory) {
        return accessList;
    }
    
    function checkAccess(address user) external view returns (bool) {
        return hasAccess[user];
    }
}

/**
 * @title ProfileFactory
 * @dev Factory para crear contratos de perfil - SIN COUNTERS
 */
contract ProfileFactory is ReentrancyGuard {
    // ✅ Contador simple en lugar de Counters.sol
    uint256 private _profileCounter;
    
    struct Profile {
        uint256 id;
        address contractAddress;
        address owner;
        string name;
        uint256 createdAt;
        bool isActive;
    }
    
    mapping(uint256 => Profile) public profiles;
    mapping(address => uint256[]) public ownerProfiles;
    mapping(address => uint256) public contractToProfile;
    uint256[] public activeProfiles;
    
    event ProfileCreated(
        uint256 indexed profileId,
        address indexed owner,
        address contractAddress,
        string name,
        uint256 timestamp
    );
    
    function createProfile(
        string memory _name,
        string memory _title,
        string memory _company,
        string memory _experience,
        uint256 _accessPrice
    ) external returns (uint256 profileId, address contractAddress) {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(_accessPrice > 0, "Access price must be greater than 0");
        
        // ✅ Incrementar contador simple
        _profileCounter++;
        profileId = _profileCounter;
        
        // Crear información pública
        ProfileContract.PublicInfo memory publicInfo = ProfileContract.PublicInfo({
            name: _name,
            title: _title,
            company: _company,
            experience: _experience,
            linkedin: "",
            twitter: "",
            github: "",
            website: ""
        });
        
        // Desplegar nuevo contrato
        ProfileContract newProfile = new ProfileContract(
            msg.sender,
            _accessPrice,
            publicInfo
        );
        contractAddress = address(newProfile);
        
        // Guardar información
        profiles[profileId] = Profile({
            id: profileId,
            contractAddress: contractAddress,
            owner: msg.sender,
            name: _name,
            createdAt: block.timestamp,
            isActive: true
        });
        
        ownerProfiles[msg.sender].push(profileId);
        contractToProfile[contractAddress] = profileId;
        activeProfiles.push(profileId);
        
        emit ProfileCreated(profileId, msg.sender, contractAddress, _name, block.timestamp);
        
        return (profileId, contractAddress);
    }
    
    function getProfile(uint256 _profileId) external view returns (Profile memory) {
        require(_profileId <= _profileCounter && _profileId > 0, "Profile does not exist");
        return profiles[_profileId];
    }
    
    function getActiveProfiles() external view returns (uint256[] memory) {
        return activeProfiles;
    }
    
    function getTotalProfiles() external view returns (uint256) {
        return _profileCounter;
    }
    
    function getOwnerProfiles(address _owner) external view returns (uint256[] memory) {
        return ownerProfiles[_owner];
    }
    
    function deactivateProfile(uint256 _profileId) external {
        require(_profileId <= _profileCounter && _profileId > 0, "Profile does not exist");
        require(profiles[_profileId].owner == msg.sender, "Not the owner");
        require(profiles[_profileId].isActive, "Profile already inactive");
        
        profiles[_profileId].isActive = false;
        
        // Remover de activeProfiles
        for (uint256 i = 0; i < activeProfiles.length; i++) {
            if (activeProfiles[i] == _profileId) {
                activeProfiles[i] = activeProfiles[activeProfiles.length - 1];
                activeProfiles.pop();
                break;
            }
        }
    }
}