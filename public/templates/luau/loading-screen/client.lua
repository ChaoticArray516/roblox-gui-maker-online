--[[
    Loading Screen - Client Side
    A loading screen with progress bar, rotating tips, and fade-out
    Features: Animated progress, gameplay tips, smooth transitions, asset tracking
]]

-- Services
local Players = game:GetService("Players")
local TweenService = game:GetService("TweenService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local ContentProvider = game:GetService("ContentProvider")
local RunService = game:GetService("RunService")
local Lighting = game:GetService("Lighting")

local player = Players.LocalPlayer
local playerGui = player:WaitForChild("PlayerGui")

-- Constants
local PROGRESS_DURATION = 8 -- Minimum seconds to show loading screen
local TIP_ROTATION_INTERVAL = 4 -- Seconds between tips
local FADE_OUT_DURATION = 1.5 -- Fade out animation time
local PROGRESS_BAR_WIDTH = 400
local PROGRESS_BAR_HEIGHT = 12

-- Colors
local COLOR_BG = Color3.fromRGB(15, 15, 25)
local COLOR_BG_GRADIENT_TOP = Color3.fromRGB(20, 20, 40)
local COLOR_BG_GRADIENT_BOTTOM = Color3.fromRGB(10, 10, 20)
local COLOR_ACCENT = Color3.fromRGB(100, 180, 255)
local COLOR_ACCENT_GLOW = Color3.fromRGB(80, 140, 220)
local COLOR_TEXT_PRIMARY = Color3.fromRGB(255, 255, 255)
local COLOR_TEXT_SECONDARY = Color3.fromRGB(150, 160, 180)
local COLOR_TEXT_MUTED = Color3.fromRGB(80, 90, 110)
local COLOR_PROGRESS_BG = Color3.fromRGB(35, 38, 50)
local COLOR_PROGRESS_FILL = Color3.fromRGB(100, 180, 255)
local COLOR_TIP_HIGHLIGHT = Color3.fromRGB(255, 200, 80)

-- Tween presets
local tweenInfoStandard = TweenInfo.new(0.3, Enum.EasingStyle.Quad, Enum.EasingDirection.Out)
local tweenInfoSmooth = TweenInfo.new(0.5, Enum.EasingStyle.Quad, Enum.EasingDirection.Out)
local tweenInfoFadeOut = TweenInfo.new(FADE_OUT_DURATION, Enum.EasingStyle.Quad, Enum.EasingDirection.Out)
local tweenInfoTipFade = TweenInfo.new(0.4, Enum.EasingStyle.Quad, Enum.EasingDirection.InOut)

-- Gameplay Tips (rotate through these)
local GAMEPLAY_TIPS = {
    "Press 'E' to interact with objects around the world.",
    "Use the map (M key) to fast-travel to discovered locations.",
    "Complete daily quests for bonus rewards and XP.",
    "Team up with friends for harder challenges and better loot.",
    "Upgrade your equipment at the blacksmith regularly.",
    "Explore hidden areas to find rare collectibles.",
    "Join a guild to access exclusive events and rewards.",
    "Use potions wisely - they have a cooldown between uses.",
    "Check the leaderboard to see how you rank globally.",
    "Customize your character at the wardrobe station.",
    "Trade with other players at the marketplace.",
    "Save your game progress frequently at save points.",
}

-- GUI References
local loadingGui, progressBarFill, progressText, progressStatus
local tipText, tipDots = {}, {}
local fadeOutOverlay, assetsLoadedLabel, timeElapsedLabel
local backgroundGradient

-- State
local isLoadingComplete = false
local currentTipIndex = 1
local loadingStartTime = 0
local assetsToLoad = {}
local assetsLoaded = 0

-----------------------------------------------------------
-- Helper Functions
-----------------------------------------------------------

local function Create(className, props)
    local instance = Instance.new(className)
    for key, value in pairs(props or {}) do
        instance[key] = value
    end
    return instance
end

local function Tween(instance, properties, tweenInfoOverride)
    local info = tweenInfoOverride or tweenInfoStandard
    local tween = TweenService:Create(instance, info, properties)
    tween:Play()
    return tween
end

-----------------------------------------------------------
-- UI Construction
-----------------------------------------------------------

local function BuildUI()
    -- ScreenGui
    loadingGui = Create("ScreenGui", {
        Name = "LoadingScreenGui",
        ResetOnSpawn = false,
        ZIndexBehavior = Enum.ZIndexBehavior.Sibling,
        DisplayOrder = 999, -- On top of everything
        Parent = playerGui,
    })

    -- Background Frame
    local bgFrame = Create("Frame", {
        Name = "BackgroundFrame",
        Size = UDim2.new(1, 0, 1, 0),
        BackgroundColor3 = COLOR_BG,
        BorderSizePixel = 0,
        ZIndex = 1000,
        Parent = loadingGui,
    })

    backgroundGradient = Create("UIGradient", {
        Color = ColorSequence.new({
            ColorSequenceKeypoint.new(0, COLOR_BG_GRADIENT_TOP),
            ColorSequenceKeypoint.new(0.5, Color3.fromRGB(15, 15, 30)),
            ColorSequenceKeypoint.new(1, COLOR_BG_GRADIENT_BOTTOM),
        }),
        Rotation = 0,
        Parent = bgFrame,
    })

    -- Subtle background pattern
    Create("ImageLabel", {
        Name = "BackgroundPattern",
        Size = UDim2.new(1, 0, 1, 0),
        BackgroundTransparency = 1,
        Image = "rbxassetid://6071575925", -- Dot grid pattern
        ImageColor3 = Color3.fromRGB(255, 255, 255),
        ImageTransparency = 0.95,
        ScaleType = Enum.ScaleType.Tile,
        TileSize = UDim2.new(0, 30, 0, 30),
        ZIndex = 1001,
        Parent = bgFrame,
    })

    -- Logo Container
    local logoContainer = Create("Frame", {
        Name = "LogoContainer",
        Size = UDim2.new(0, 300, 0, 120),
        Position = UDim2.new(0.5, -150, 0.35, -60),
        AnchorPoint = Vector2.new(0.5, 0.5),
        BackgroundTransparency = 1,
        ZIndex = 1002,
        Parent = loadingGui,
    })

    -- Game Logo (placeholder - replace with your game logo)
    Create("ImageLabel", {
        Name = "GameLogo",
        Size = UDim2.new(0, 80, 0, 80),
        Position = UDim2.new(0.5, -40, 0, 0),
        BackgroundTransparency = 1,
        Image = "rbxassetid://7072706316", -- Placeholder star icon
        ImageColor3 = COLOR_ACCENT,
        ZIndex = 1003,
        Parent = logoContainer,
    })

    -- Game Title
    Create("TextLabel", {
        Name = "GameTitle",
        Size = UDim2.new(1, 0, 0, 36),
        Position = UDim2.new(0, 0, 0, 84),
        BackgroundTransparency = 1,
        Text = "YOUR GAME TITLE",
        TextColor3 = COLOR_TEXT_PRIMARY,
        TextSize = 28,
        Font = Enum.Font.GothamBlack,
        TextXAlignment = Enum.TextXAlignment.Center,
        ZIndex = 1003,
        Parent = logoContainer,
    })

    -- Subtitle
    Create("TextLabel", {
        Name = "GameSubtitle",
        Size = UDim2.new(1, 0, 0, 20),
        Position = UDim2.new(0, 0, 0, 120),
        BackgroundTransparency = 1,
        Text = "Loading your adventure...",
        TextColor3 = COLOR_TEXT_SECONDARY,
        TextSize = 14,
        Font = Enum.Font.Gotham,
        TextXAlignment = Enum.TextXAlignment.Center,
        ZIndex = 1003,
        Parent = logoContainer,
    })

    -- Progress Section
    local progressSection = Create("Frame", {
        Name = "ProgressSection",
        Size = UDim2.new(0, PROGRESS_BAR_WIDTH, 0, 80),
        Position = UDim2.new(0.5, -PROGRESS_BAR_WIDTH/2, 0.55, 0),
        AnchorPoint = Vector2.new(0.5, 0),
        BackgroundTransparency = 1,
        ZIndex = 1002,
        Parent = loadingGui,
    })

    -- Progress Bar Background
    local progressBarBg = Create("Frame", {
        Name = "ProgressBarBackground",
        Size = UDim2.new(1, 0, 0, PROGRESS_BAR_HEIGHT),
        Position = UDim2.new(0, 0, 0, 0),
        BackgroundColor3 = COLOR_PROGRESS_BG,
        BorderSizePixel = 0,
        ZIndex = 1003,
        Parent = progressSection,
    })

    Create("UICorner", {
        CornerRadius = UDim.new(0, PROGRESS_BAR_HEIGHT/2),
        Parent = progressBarBg,
    })

    -- Progress Bar Fill
    progressBarFill = Create("Frame", {
        Name = "ProgressBarFill",
        Size = UDim2.new(0, 0, 1, 0),
        BackgroundColor3 = COLOR_PROGRESS_FILL,
        BorderSizePixel = 0,
        ZIndex = 1004,
        Parent = progressBarBg,
    })

    Create("UICorner", {
        CornerRadius = UDim.new(0, PROGRESS_BAR_HEIGHT/2),
        Parent = progressBarFill,
    })

    -- Gradient on fill
    Create("UIGradient", {
        Color = ColorSequence.new({
            ColorSequenceKeypoint.new(0, Color3.fromRGB(150, 210, 255)),
            ColorSequenceKeypoint.new(1, COLOR_PROGRESS_FILL),
        }),
        Rotation = 0,
        Parent = progressBarFill,
    })

    -- Moving shine effect on progress bar
    local progressShine = Create("Frame", {
        Name = "ProgressBarShine",
        Size = UDim2.new(0, 60, 1, 0),
        Position = UDim2.new(0, -60, 0, 0),
        BackgroundColor3 = Color3.fromRGB(255, 255, 255),
        BackgroundTransparency = 0.7,
        BorderSizePixel = 0,
        ZIndex = 1005,
        Parent = progressBarFill,
    })

    Create("UIGradient", {
        Color = ColorSequence.new({
            ColorSequenceKeypoint.new(0, Color3.fromRGB(255, 255, 255)),
            ColorSequenceKeypoint.new(0.5, Color3.fromRGB(255, 255, 255)),
            ColorSequenceKeypoint.new(1, Color3.fromRGB(255, 255, 255)),
        }),
        Transparency = NumberSequence.new({
            NumberSequenceKeypoint.new(0, 1),
            NumberSequenceKeypoint.new(0.5, 0),
            NumberSequenceKeypoint.new(1, 1),
        }),
        Parent = progressShine,
    })

    -- Glow around progress bar
    Create("UIStroke", {
        Color = COLOR_ACCENT_GLOW,
        Thickness = 1,
        Transparency = 0.6,
        Parent = progressBarBg,
    })

    -- Progress Text (percentage)
    progressText = Create("TextLabel", {
        Name = "ProgressText",
        Size = UDim2.new(0, 80, 0, 24),
        Position = UDim2.new(0, 0, 0, PROGRESS_BAR_HEIGHT + 8),
        BackgroundTransparency = 1,
        Text = "0%",
        TextColor3 = COLOR_ACCENT,
        TextSize = 16,
        Font = Enum.Font.GothamBold,
        TextXAlignment = Enum.TextXAlignment.Left,
        ZIndex = 1003,
        Parent = progressSection,
    })

    -- Progress Status
    progressStatus = Create("TextLabel", {
        Name = "ProgressStatus",
        Size = UDim2.new(1, -90, 0, 24),
        Position = UDim2.new(0, 90, 0, PROGRESS_BAR_HEIGHT + 8),
        BackgroundTransparency = 1,
        Text = "Initializing...",
        TextColor3 = COLOR_TEXT_SECONDARY,
        TextSize = 13,
        Font = Enum.Font.Gotham,
        TextXAlignment = Enum.TextXAlignment.Right,
        TextTruncate = Enum.TextTruncate.AtEnd,
        ZIndex = 1003,
        Parent = progressSection,
    })

    -- Tips Section
    local tipsSection = Create("Frame", {
        Name = "TipsSection",
        Size = UDim2.new(0, 500, 0, 80),
        Position = UDim2.new(0.5, -250, 0.7, 0),
        AnchorPoint = Vector2.new(0.5, 0),
        BackgroundTransparency = 1,
        ZIndex = 1002,
        Parent = loadingGui,
    })

    -- Tip Icon
    Create("TextLabel", {
        Name = "TipIcon",
        Size = UDim2.new(0, 30, 0, 30),
        Position = UDim2.new(0, 0, 0, 0),
        BackgroundTransparency = 1,
        Text = "i",
        TextColor3 = COLOR_TIP_HIGHLIGHT,
        TextSize = 20,
        Font = Enum.Font.GothamBold,
        TextXAlignment = Enum.TextXAlignment.Center,
        ZIndex = 1003,
        Parent = tipsSection,
    })

    -- Tip Label
    Create("TextLabel", {
        Name = "TipLabel",
        Size = UDim2.new(0, 80, 0, 20),
        Position = UDim2.new(0, 30, 0, 5),
        BackgroundTransparency = 1,
        Text = "DID YOU KNOW?",
        TextColor3 = COLOR_TIP_HIGHLIGHT,
        TextSize = 11,
        Font = Enum.Font.GothamBold,
        TextXAlignment = Enum.TextXAlignment.Left,
        ZIndex = 1003,
        Parent = tipsSection,
    })

    -- Tip Text
    tipText = Create("TextLabel", {
        Name = "TipText",
        Size = UDim2.new(1, -30, 0, 40),
        Position = UDim2.new(0, 30, 0, 24),
        BackgroundTransparency = 1,
        Text = GAMEPLAY_TIPS[1],
        TextColor3 = COLOR_TEXT_SECONDARY,
        TextSize = 14,
        Font = Enum.Font.Gotham,
        TextXAlignment = Enum.TextXAlignment.Left,
        TextWrapped = true,
        ZIndex = 1003,
        Parent = tipsSection,
    })

    -- Tip Indicator Dots
    local dotContainer = Create("Frame", {
        Name = "TipIndicatorContainer",
        Size = UDim2.new(1, 0, 0, 12),
        Position = UDim2.new(0, 0, 0, 68),
        BackgroundTransparency = 1,
        ZIndex = 1003,
        Parent = tipsSection,
    })

    for i = 1, math.min(#GAMEPLAY_TIPS, 8) do
        local dot = Create("Frame", {
            Name = "TipDot_" .. i,
            Size = UDim2.new(0, 8, 0, 8),
            Position = UDim2.new(0.5, (i - 4.5) * 16 - 4, 0.5, -4),
            BackgroundColor3 = (i == 1) and COLOR_ACCENT or COLOR_TEXT_MUTED,
            BackgroundTransparency = (i == 1) and 0 or 0.5,
            BorderSizePixel = 0,
            ZIndex = 1004,
            Parent = dotContainer,
        })
        Create("UICorner", {
            CornerRadius = UDim.new(1, 0),
            Parent = dot,
        })
        tipDots[i] = dot
    end

    -- Stats Section
    local statsSection = Create("Frame", {
        Name = "StatsSection",
        Size = UDim2.new(0, 400, 0, 30),
        Position = UDim2.new(0.5, -200, 0.88, 0),
        AnchorPoint = Vector2.new(0.5, 0),
        BackgroundTransparency = 1,
        ZIndex = 1002,
        Parent = loadingGui,
    })

    assetsLoadedLabel = Create("TextLabel", {
        Name = "AssetsLoadedLabel",
        Size = UDim2.new(0.5, 0, 1, 0),
        Position = UDim2.new(0, 0, 0, 0),
        BackgroundTransparency = 1,
        Text = "Assets: 0/0",
        TextColor3 = COLOR_TEXT_MUTED,
        TextSize = 11,
        Font = Enum.Font.Gotham,
        TextXAlignment = Enum.TextXAlignment.Left,
        ZIndex = 1003,
        Parent = statsSection,
    })

    timeElapsedLabel = Create("TextLabel", {
        Name = "TimeElapsedLabel",
        Size = UDim2.new(0.5, 0, 1, 0),
        Position = UDim2.new(0.5, 0, 0, 0),
        BackgroundTransparency = 1,
        Text = "Time: 0.0s",
        TextColor3 = COLOR_TEXT_MUTED,
        TextSize = 11,
        Font = Enum.Font.Gotham,
        TextXAlignment = Enum.TextXAlignment.Right,
        ZIndex = 1003,
        Parent = statsSection,
    })

    -- Fade Out Overlay (used for fade-out transition)
    fadeOutOverlay = Create("Frame", {
        Name = "FadeOutOverlay",
        Size = UDim2.new(1, 0, 1, 0),
        Position = UDim2.new(0, 0, 0, 0),
        BackgroundColor3 = Color3.fromRGB(0, 0, 0),
        BackgroundTransparency = 1,
        BorderSizePixel = 0,
        ZIndex = 2000,
        Parent = loadingGui,
    })

    -- Skip Button (for debugging, hidden by default)
    local skipButton = Create("TextButton", {
        Name = "SkipButton",
        Size = UDim2.new(0, 80, 0, 28),
        Position = UDim2.new(1, -100, 1, -40),
        BackgroundColor3 = COLOR_PROGRESS_BG,
        BackgroundTransparency = 0.5,
        Text = "Skip >>",
        TextColor3 = COLOR_TEXT_MUTED,
        TextSize = 11,
        Font = Enum.Font.Gotham,
        AutoButtonColor = false,
        Visible = false, -- Set true for debugging
        ZIndex = 1002,
        Parent = loadingGui,
    })

    Create("UICorner", {
        CornerRadius = UDim.new(0, 6),
        Parent = skipButton,
    })

    skipButton.MouseButton1Click:Connect(function()
        isLoadingComplete = true
    end)
end

-----------------------------------------------------------
-- Progress Update
-----------------------------------------------------------

local function SetProgress(percent, status)
    percent = math.clamp(percent, 0, 1)

    -- Update progress bar fill
    Tween(progressBarFill, {
        Size = UDim2.new(percent, 0, 1, 0)
    }, tweenInfoStandard)

    -- Update progress text
    progressText.Text = tostring(math.floor(percent * 100)) .. "%"

    -- Update status
    if status then
        progressStatus.Text = status
    end

    -- Animate shine effect across the fill
    local shine = progressBarFill:FindFirstChild("ProgressBarShine")
    if shine then
        Tween(shine, {
            Position = UDim2.new(1, -60, 0, 0)
        }, TweenInfo.new(0.6, Enum.EasingStyle.Quad, Enum.EasingDirection.Out))
        task.delay(0.3, function()
            shine.Position = UDim2.new(0, -60, 0, 0)
        end)
    end

    -- Scale animation on percentage text for key milestones
    if percent == 0.25 or percent == 0.5 or percent == 0.75 or percent == 1 then
        Tween(progressText, {TextSize = 20}, tweenInfoSmooth)
        task.delay(0.2, function()
            Tween(progressText, {TextSize = 16}, tweenInfoSmooth)
        end)
    end
end

-----------------------------------------------------------
-- Tip Rotation
-----------------------------------------------------------

local function RotateTip()
    -- Fade out current tip
    Tween(tipText, {TextTransparency = 1}, tweenInfoTipFade)

    task.delay(0.4, function()
        -- Update tip index
        currentTipIndex = currentTipIndex + 1
        if currentTipIndex > #GAMEPLAY_TIPS then
            currentTipIndex = 1
        end

        -- Update text
        tipText.Text = GAMEPLAY_TIPS[currentTipIndex]

        -- Fade in new tip
        Tween(tipText, {TextTransparency = 0}, tweenInfoTipFade)
    end)

    -- Update dot indicators
    for i, dot in pairs(tipDots) do
        if i == currentTipIndex then
            Tween(dot, {
                BackgroundColor3 = COLOR_ACCENT,
                BackgroundTransparency = 0,
                Size = UDim2.new(0, 10, 0, 10),
                Position = UDim2.new(0.5, (i - 4.5) * 16 - 5, 0.5, -5),
            })
        else
            Tween(dot, {
                BackgroundColor3 = COLOR_TEXT_MUTED,
                BackgroundTransparency = 0.5,
                Size = UDim2.new(0, 8, 0, 8),
                Position = UDim2.new(0.5, (i - 4.5) * 16 - 4, 0.5, -4),
            })
        end
    end
end

local tipRotationConnection = nil

local function StartTipRotation()
    if tipRotationConnection then
        tipRotationConnection:Disconnect()
    end

    local accumulator = 0
    tipRotationConnection = RunService.Heartbeat:Connect(function(dt)
        accumulator = accumulator + dt
        if accumulator >= TIP_ROTATION_INTERVAL then
            accumulator = 0
            RotateTip()
        end
    end)
end

local function StopTipRotation()
    if tipRotationConnection then
        tipRotationConnection:Disconnect()
        tipRotationConnection = nil
    end
end

-----------------------------------------------------------
-- Asset Preloading
-----------------------------------------------------------

-- Collect important assets to preload
local function CollectAssets()
    local assets = {}

    -- Add all image/decal IDs from ReplicatedStorage
    for _, obj in ipairs(ReplicatedStorage:GetDescendants()) do
        if obj:IsA("ImageLabel") or obj:IsA("ImageButton") then
            if obj.Image ~= "" and obj.Image:find("rbxassetid://") then
                table.insert(assets, obj.Image)
            end
        end
        if obj:IsA("Sound") and obj.SoundId ~= "" then
            table.insert(assets, obj.SoundId)
        end
    end

    -- Add Lighting assets
    for _, child in ipairs(Lighting:GetChildren()) do
        if child:IsA("Sky") then
            for _, prop in ipairs({"SkyboxUp", "SkyboxDn", "SkyboxLf", "SkyboxRt", "SkyboxFt", "SkyboxBk"}) do
                local id = child[prop]
                if id and id ~= "" then
                    table.insert(assets, id)
                end
            end
        end
    end

    return assets
end

local function PreloadAssets(assets)
    assetsToLoad = assets
    local totalAssets = #assets

    if totalAssets == 0 then
        return -- Nothing to preload
    end

    -- Preload in batches
    local batchSize = 10
    for i = 1, totalAssets, batchSize do
        local batch = {}
        for j = i, math.min(i + batchSize - 1, totalAssets) do
            table.insert(batch, assets[j])
        end

        ContentProvider:PreloadAsync(batch, function(assetId, assetFetchStatus)
            assetsLoaded = assetsLoaded + 1
            local progress = assetsLoaded / totalAssets

            -- Update status
            local status = string.format("Loading asset %d/%d...", assetsLoaded, totalAssets)
            SetProgress(progress, status)

            -- Update stats
            assetsLoadedLabel.Text = string.format("Assets: %d/%d", assetsLoaded, totalAssets)
        end)
    end
end

-----------------------------------------------------------
-- Background Animation
-----------------------------------------------------------

local gradientConnection = nil

local function StartBackgroundAnimation()
    if gradientConnection then
        gradientConnection:Disconnect()
    end

    local rotation = 0
    gradientConnection = RunService.Heartbeat:Connect(function(dt)
        rotation = rotation + dt * 2
        if rotation > 360 then
            rotation = rotation - 360
        end
        if backgroundGradient then
            backgroundGradient.Rotation = math.sin(rotation * 0.1) * 15
        end
    end)
end

local function StopBackgroundAnimation()
    if gradientConnection then
        gradientConnection:Disconnect()
        gradientConnection = nil
    end
end

-----------------------------------------------------------
-- Loading Sequence
-----------------------------------------------------------

local function RunLoadingSequence()
    loadingStartTime = tick()

    -- Phase 1: Initializing (0% - 20%)
    SetProgress(0, "Initializing...")
    task.wait(0.5)

    -- Phase 2: Collect and preload assets (20% - 80%)
    SetProgress(0.2, "Scanning assets...")
    task.wait(0.3)

    local assets = CollectAssets()

    if #assets > 0 then
        SetProgress(0.25, string.format("Preloading %d assets...", #assets))
        PreloadAssets(assets)
    else
        -- Simulate loading if no assets to preload
        for i = 1, 10 do
            task.wait(PROGRESS_DURATION / 20)
            SetProgress(0.25 + (i / 10) * 0.55, "Loading game data...")
            assetsLoadedLabel.Text = string.format("Assets: %d/0", i)
        end
    end

    -- Ensure minimum display time
    local elapsed = tick() - loadingStartTime
    local remaining = PROGRESS_DURATION - elapsed

    if remaining > 0 then
        -- Phase 3: Finalizing (80% - 100%)
        SetProgress(0.8, "Finalizing...")

        -- Gradually fill to 100%
        local steps = 20
        for i = 1, steps do
            task.wait(remaining / steps)
            local progress = 0.8 + (i / steps) * 0.2
            SetProgress(progress, i < steps and "Finalizing..." or "Ready!")

            -- Update elapsed time
            timeElapsedLabel.Text = string.format("Time: %.1fs", tick() - loadingStartTime)
        end
    end

    SetProgress(1, "Ready!")
    task.wait(0.5)

    isLoadingComplete = true
end

-----------------------------------------------------------
-- Fade Out and Cleanup
-----------------------------------------------------------

local function FadeOutAndCleanup()
    -- Stop animations
    StopTipRotation()
    StopBackgroundAnimation()

    -- Fade out overlay
    fadeOutOverlay.BackgroundTransparency = 0

    -- Fade out entire loading screen
    Tween(fadeOutOverlay, {BackgroundTransparency = 1}, tweenInfoFadeOut)

    -- Also fade all children
    for _, child in ipairs(loadingGui:GetDescendants()) do
        if child:IsA("GuiObject") and child ~= fadeOutOverlay then
            local targetTransparency = 1
            if child:IsA("TextLabel") or child:IsA("TextButton") then
                Tween(child, {TextTransparency = targetTransparency}, tweenInfoFadeOut)
            elseif child:IsA("ImageLabel") or child:IsA("ImageButton") then
                Tween(child, {ImageTransparency = targetTransparency}, tweenInfoFadeOut)
            end
            if child.BackgroundTransparency < 1 then
                Tween(child, {BackgroundTransparency = targetTransparency}, tweenInfoFadeOut)
            end
        end
    end

    -- Wait for fade then destroy
    task.delay(FADE_OUT_DURATION, function()
        if loadingGui and loadingGui.Parent then
            loadingGui:Destroy()
        end
    end)
end

-----------------------------------------------------------
-- Wait for game to be ready
-----------------------------------------------------------

local function WaitForGameReady()
    -- Wait for essential services
    local servicesReady = false
    local attempts = 0

    repeat
        attempts = attempts + 1
        local success = pcall(function()
            -- Check if workspace is loaded
            local _ = workspace:WaitForChild("Terrain", 2)
            -- Check if player character data is available
            local _ = player:WaitForChild("PlayerGui", 2)
        end)
        servicesReady = success
        if not servicesReady then
            task.wait(0.1)
        end
    until servicesReady or attempts > 50

    return servicesReady
end

-----------------------------------------------------------
-- Initialization
-----------------------------------------------------------

local function Initialize()
    BuildUI()
    StartBackgroundAnimation()
    StartTipRotation()

    -- Wait for game to be ready
    WaitForGameReady()

    -- Run loading sequence in background
    task.spawn(function()
        RunLoadingSequence()
    end)

    -- Wait for loading to complete
    task.spawn(function()
        while not isLoadingComplete do
            task.wait(0.1)
            -- Update elapsed time
            if timeElapsedLabel and timeElapsedLabel.Parent then
                timeElapsedLabel.Text = string.format("Time: %.1fs", tick() - loadingStartTime)
            end
        end

        -- Fade out
        FadeOutAndCleanup()
    end)

    print("[LoadingScreen] Loading screen initialized.")
end

Initialize()
