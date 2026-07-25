// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title Campaign
 * @dev Individual crowdfunding campaign contract
 */
contract Campaign {
    struct Contribution {
        uint256 amount;
        uint256 timestamp;
        bool refunded;
    }
    
    struct Milestone {
        string description;
        uint256 amount;
        bool completed;
        bool fundsReleased;
    }
    
    address public creator;
    string public title;
    string public description;
    string public category;
    uint256 public goal;
    uint256 public deadline;
    uint256 public totalRaised;
    bool public goalReached;
    bool public fundsWithdrawn;
    bool public campaignCancelled;
    
    mapping(address => Contribution) public contributions;
    address[] public contributors;
    mapping(address => bool) public hasContributed;
    
    Milestone[] public milestones;
    
    event ContributionMade(address indexed contributor, uint256 amount);
    event GoalReached(uint256 totalAmount);
    event FundsWithdrawn(address indexed creator, uint256 amount);
    event RefundIssued(address indexed contributor, uint256 amount);
    event CampaignCancelled();
    event MilestoneAdded(uint256 index, string description, uint256 amount);
    event MilestoneCompleted(uint256 index);
    
    modifier onlyCreator() {
        require(msg.sender == creator, "Only creator can call this function");
        _;
    }
    
    modifier campaignActive() {
        require(block.timestamp < deadline, "Campaign has ended");
        require(!campaignCancelled, "Campaign has been cancelled");
        _;
    }
    
    modifier campaignEnded() {
        require(block.timestamp >= deadline, "Campaign is still active");
        _;
    }
    
    constructor(
        address _creator,
        string memory _title,
        string memory _description,
        uint256 _goal,
        uint256 _deadline,
        string memory _category
    ) {
        creator = _creator;
        title = _title;
        description = _description;
        goal = _goal;
        deadline = _deadline;
        category = _category;
    }
    
    /**
     * @dev Contribute to the campaign
     */
    function contribute() public payable campaignActive {
        require(msg.value > 0, "Contribution must be greater than 0");
        
        if (!hasContributed[msg.sender]) {
            contributors.push(msg.sender);
            hasContributed[msg.sender] = true;
        }
        
        contributions[msg.sender].amount += msg.value;
        contributions[msg.sender].timestamp = block.timestamp;
        totalRaised += msg.value;
        
        emit ContributionMade(msg.sender, msg.value);
        
        if (totalRaised >= goal && !goalReached) {
            goalReached = true;
            emit GoalReached(totalRaised);
        }
    }
    
    /**
     * @dev Withdraw funds if goal is reached (creator only)
     */
    function withdrawFunds() public onlyCreator campaignEnded {
        require(goalReached, "Goal not reached");
        require(!fundsWithdrawn, "Funds already withdrawn");
        require(!campaignCancelled, "Campaign was cancelled");
        
        fundsWithdrawn = true;
        uint256 amount = address(this).balance;
        
        (bool success, ) = payable(creator).call{value: amount}("");
        require(success, "Transfer failed");
        
        emit FundsWithdrawn(creator, amount);
    }
    
    /**
     * @dev Request refund if goal not reached (contributors only)
     */
    function requestRefund() public campaignEnded {
        require(!goalReached || campaignCancelled, "Goal was reached");
        require(hasContributed[msg.sender], "No contribution found");
        require(!contributions[msg.sender].refunded, "Already refunded");
        
        uint256 amount = contributions[msg.sender].amount;
        require(amount > 0, "No contribution to refund");
        
        contributions[msg.sender].refunded = true;
        
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Refund failed");
        
        emit RefundIssued(msg.sender, amount);
    }
    
    /**
     * @dev Cancel campaign (creator only, before deadline)
     */
    function cancelCampaign() public onlyCreator {
        require(block.timestamp < deadline, "Cannot cancel after deadline");
        require(!fundsWithdrawn, "Funds already withdrawn");
        
        campaignCancelled = true;
        emit CampaignCancelled();
    }
    
    /**
     * @dev Add milestone (creator only)
     */
    function addMilestone(string memory _description, uint256 _amount) public onlyCreator {
        require(_amount > 0, "Milestone amount must be greater than 0");
        
        milestones.push(Milestone({
            description: _description,
            amount: _amount,
            completed: false,
            fundsReleased: false
        }));
        
        emit MilestoneAdded(milestones.length - 1, _description, _amount);
    }
    
    /**
     * @dev Mark milestone as completed (creator only)
     */
    function completeMilestone(uint256 _milestoneIndex) public onlyCreator {
        require(_milestoneIndex < milestones.length, "Invalid milestone index");
        require(!milestones[_milestoneIndex].completed, "Milestone already completed");
        
        milestones[_milestoneIndex].completed = true;
        emit MilestoneCompleted(_milestoneIndex);
    }
    
    /**
     * @dev Get campaign summary
     */
    function getSummary() public view returns (
        address,
        string memory,
        string memory,
        uint256,
        uint256,
        uint256,
        uint256,
        bool,
        bool,
        bool
    ) {
        return (
            creator,
            title,
            description,
            goal,
            deadline,
            totalRaised,
            contributors.length,
            goalReached,
            fundsWithdrawn,
            campaignCancelled
        );
    }
    
    /**
     * @dev Get contributor count
     */
    function getContributorCount() public view returns (uint256) {
        return contributors.length;
    }
    
    /**
     * @dev Get milestone count
     */
    function getMilestoneCount() public view returns (uint256) {
        return milestones.length;
    }
    
    /**
     * @dev Check if campaign is active
     */
    function isActive() public view returns (bool) {
        return block.timestamp < deadline && !campaignCancelled;
    }
    
    /**
     * @dev Get time remaining
     */
    function getTimeRemaining() public view returns (uint256) {
        if (block.timestamp >= deadline) {
            return 0;
        }
        return deadline - block.timestamp;
    }
}
