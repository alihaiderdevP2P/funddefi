// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./Campaign.sol";

/**
 * @title CrowdfundingFactory
 * @dev Factory contract for creating and managing crowdfunding campaigns
 */
contract CrowdfundingFactory {
    address[] public deployedCampaigns;
    mapping(address => address[]) public creatorCampaigns;
    mapping(address => bool) public isCampaign;
    
    event CampaignCreated(
        address indexed campaignAddress,
        address indexed creator,
        string title,
        uint256 goal,
        uint256 deadline
    );
    
    /**
     * @dev Creates a new crowdfunding campaign
     * @param _title Campaign title
     * @param _description Campaign description
     * @param _goal Funding goal in wei
     * @param _durationInDays Campaign duration in days
     * @param _category Campaign category
     */
    function createCampaign(
        string memory _title,
        string memory _description,
        uint256 _goal,
        uint256 _durationInDays,
        string memory _category
    ) public {
        require(_goal > 0, "Goal must be greater than 0");
        require(_durationInDays > 0 && _durationInDays <= 90, "Duration must be 1-90 days");
        require(bytes(_title).length > 0, "Title cannot be empty");
        
        uint256 deadline = block.timestamp + (_durationInDays * 1 days);
        
        Campaign newCampaign = new Campaign(
            msg.sender,
            _title,
            _description,
            _goal,
            deadline,
            _category
        );
        
        address campaignAddress = address(newCampaign);
        
        deployedCampaigns.push(campaignAddress);
        creatorCampaigns[msg.sender].push(campaignAddress);
        isCampaign[campaignAddress] = true;
        
        emit CampaignCreated(campaignAddress, msg.sender, _title, _goal, deadline);
    }
    
    /**
     * @dev Returns all deployed campaigns
     */
    function getDeployedCampaigns() public view returns (address[] memory) {
        return deployedCampaigns;
    }
    
    /**
     * @dev Returns campaigns created by a specific address
     */
    function getCampaignsByCreator(address creator) public view returns (address[] memory) {
        return creatorCampaigns[creator];
    }
    
    /**
     * @dev Returns the total number of campaigns
     */
    function getCampaignCount() public view returns (uint256) {
        return deployedCampaigns.length;
    }
}
