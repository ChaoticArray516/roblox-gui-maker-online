-- Daily Rewards GUI - Client Script
-- Daily rewards system client logic
-- Place in: StarterGui/RewardsGui (LocalScript)

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local TweenService = game:GetService("TweenService")

local player = Players.LocalPlayer
local gui = script.Parent
local panel = gui:WaitForChild("RewardsPanel")
local claimButton = panel:WaitForChild("ClaimButton")
local streakLabel = panel:WaitForChild("StreakLabel")
local timerLabel = panel:WaitForChild("TimerLabel")

local claimEvent = ReplicatedStorage:WaitForChild("ClaimDailyReward")
local stateEvent = ReplicatedStorage:WaitForChild("DailyRewardState")

-- Update the UI display
local function updateUI(state)
	streakLabel.Text = "Streak: " .. tostring(state.streak) .. " days"
	if state.claimedToday then
		claimButton.Text = "Claimed - Come back tomorrow"
		claimButton.BackgroundColor3 = Color3.fromRGB(80, 80, 80)
		claimButton.Active = false
		-- Show countdown to next reset
		local remaining = state.nextResetAt - os.time()
		if remaining > 0 then
			local hours = math.floor(remaining / 3600)
			local minutes = math.floor((remaining % 3600) / 60)
			timerLabel.Text = string.format("Next reward in %dh %dm", hours, minutes)
		end
	else
		claimButton.Text = "Claim Daily Reward"
		claimButton.BackgroundColor3 = Color3.fromRGB(109, 93, 251)
		claimButton.Active = true
		timerLabel.Text = ""
	end
end

-- Claim reveal animation
local function playClaimAnimation()
	local originalSize = panel.Size
	local grow = TweenService:Create(
		panel,
		TweenInfo.new(0.15, Enum.EasingStyle.Back, Enum.EasingDirection.Out),
		{ Size = originalSize + UDim2.fromOffset(20, 20) }
	)
	local shrink = TweenService:Create(
		panel,
		TweenInfo.new(0.15, Enum.EasingStyle.Quad, Enum.EasingDirection.In),
		{ Size = originalSize }
	)
	grow:Play()
	grow.Completed:Connect(function()
		shrink:Play()
	end)
end

-- Claim button click handler
claimButton.MouseButton1Click:Connect(function()
	if not claimButton.Active then return end
	claimEvent:FireServer()
	playClaimAnimation()
end)

-- Receive state updates from the server
stateEvent.OnClientEvent:Connect(function(state)
	updateUI(state)
end)

-- Request initial state on load
claimEvent:FireServer("query")
