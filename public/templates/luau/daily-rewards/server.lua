-- Daily Rewards GUI - Server Script
-- Daily rewards system server logic (DataStore persistence + reset logic)
-- Place in: ServerScriptService (Script)

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local DataStoreService = game:GetService("DataStoreService")

local rewardStore = DataStoreService:GetDataStore("DailyRewards")
local claimEvent = ReplicatedStorage:WaitForChild("ClaimDailyReward")
local stateEvent = ReplicatedStorage:WaitForChild("DailyRewardState")

-- Reward table: reward per streak day
local REWARD_TABLE = {
	[1] = 100,
	[2] = 120,
	[3] = 150,
	[4] = 180,
	[5] = 220,
	[6] = 280,
	[7] = 500, -- Day 7 bonus
}

local RESET_INTERVAL = 24 * 60 * 60 -- 24 hours in seconds

-- Load player state from DataStore
local function getPlayerState(userId)
	local success, data = pcall(function()
		return rewardStore:GetAsync(userId)
	end)
	if success and data then
		return data
	end
	return {
		streak = 0,
		lastClaimAt = 0,
		nextResetAt = os.time() + RESET_INTERVAL,
		claimedToday = false,
	}
end

-- Save player state to DataStore
local function savePlayerState(userId, state)
	pcall(function()
		rewardStore:SetAsync(userId, state)
	end)
end

-- Check whether the player can claim now
local function canClaim(state)
	return os.time() >= state.nextResetAt or not state.claimedToday
end

-- Handle claim requests
claimEvent.OnServerEvent:Connect(function(player, action)
	local userId = player.UserId
	local state = getPlayerState(userId)

	-- action == "query" only returns the current state
	if action == "query" then
		stateEvent:FireClient(player, state)
		return
	end

	-- Actual claim
	if not canClaim(state) then
		stateEvent:FireClient(player, state)
		return
	end

	-- Increment streak if last claim was within 48 hours, otherwise reset to 1
	local now = os.time()
	if now - state.lastClaimAt <= 2 * RESET_INTERVAL then
		state.streak = state.streak + 1
	else
		state.streak = 1
	end

	-- Cycle through the 7-day reward table
	local streakDay = ((state.streak - 1) % 7) + 1
	local reward = REWARD_TABLE[streakDay] or REWARD_TABLE[1]

	state.lastClaimAt = now
	state.claimedToday = true
	state.nextResetAt = now + RESET_INTERVAL

	savePlayerState(userId, state)

	-- TODO: Grant the reward to your currency system here
	-- Example: player.leaderstats.Coins.Value += reward
	print(string.format("[DailyRewards] %s claimed day %d reward: %d", player.Name, streakDay, reward))

	stateEvent:FireClient(player, state)
end)
