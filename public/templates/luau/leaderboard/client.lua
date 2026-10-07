--[[
    Global Leaderboard - Client Side
    A top-10 global leaderboard with OrderedDataStore integration
    Features: Auto-refresh, smooth animations, avatar display, clean UI
]]

-- Services
local Players = game:GetService("Players")
local TweenService = game:GetService("TweenService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")
local HttpService = game:GetService("HttpService")

local player = Players.LocalPlayer
local playerGui = player:WaitForChild("PlayerGui")

-- Constants
local LEADERBOARD_SIZE = UDim2.new(0, 520, 0, 600)
local LEADERBOARD_POSITION = UDim2.new(0.5, -260, 0.5, -300)
local HEADER_HEIGHT = 70
local ROW_HEIGHT = 56
local FOOTER_HEIGHT = 36
local REFRESH_INTERVAL = 60 -- seconds
local TWEEN_DURATION = 0.35
local STAGGER_DELAY = 0.05

-- Colors
local COLOR_BG = Color3.fromRGB(30, 30, 40)
local COLOR_HEADER = Color3.fromRGB(40, 45, 60)
local COLOR_ACCENT = Color3.fromRGB(255, 200, 50)
local COLOR_TEXT_PRIMARY = Color3.fromRGB(255, 255, 255)
local COLOR_TEXT_SECONDARY = Color3.fromRGB(180, 180, 190)
local COLOR_RANK_GOLD = Color3.fromRGB(255, 215, 0)
local COLOR_RANK_SILVER = Color3.fromRGB(192, 192, 192)
local COLOR_RANK_BRONZE = Color3.fromRGB(205, 127, 50)
local COLOR_ROW_EVEN = Color3.fromRGB(35, 38, 50)
local COLOR_ROW_ODD = Color3.fromRGB(42, 45, 58)
local COLOR_HIGHLIGHT = Color3.fromRGB(255, 200, 50)
local COLOR_BUTTON_HOVER = Color3.fromRGB(60, 65, 85)
local COLOR_CLOSE_RED = Color3.fromRGB(220, 60, 60)

-- Tween presets
local tweenInfoFade = TweenInfo.new(TWEEN_DURATION, Enum.EasingStyle.Quad, Enum.EasingDirection.Out)
local tweenInfoSlide = TweenInfo.new(TWEEN_DURATION * 1.2, Enum.EasingStyle.Back, Enum.EasingDirection.Out)
local tweenInfoScale = TweenInfo.new(TWEEN_DURATION * 0.8, Enum.EasingStyle.Elastic, Enum.EasingDirection.Out)
local tweenInfoPulse = TweenInfo.new(0.6, Enum.EasingStyle.Sine, Enum.EasingDirection.InOut, -1, true)

-- Remote events
local LeaderboardEvents = ReplicatedStorage:WaitForChild("LeaderboardEvents")
local RefreshEvent = LeaderboardEvents:WaitForChild("RefreshLeaderboard")
local GetLeaderboardData = LeaderboardEvents:WaitForChild("GetLeaderboardData")

-- GUI References (initialized in BuildUI)
local gui, mainFrame, entriesContainer, loadingIndicator, lastUpdatedLabel
local entryTemplate, closeButton, openButton, refreshButton

-- State
local isVisible = false
local currentEntries = {}
local refreshConnection = nil
local lastRefreshTime = 0

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
    local info = tweenInfoOverride or tweenInfoFade
    local tween = TweenService:Create(instance, info, properties)
    tween:Play()
    return tween
end

local function FormatNumber(num)
    if num >= 1e9 then
        return string.format("%.1fB", num / 1e9)
    elseif num >= 1e6 then
        return string.format("%.1fM", num / 1e6)
    elseif num >= 1e3 then
        return string.format("%.1fK", num / 1e3)
    end
    return tostring(math.floor(num))
end

local function GetRankColor(rank)
    if rank == 1 then return COLOR_RANK_GOLD end
    if rank == 2 then return COLOR_RANK_SILVER end
    if rank == 3 then return COLOR_RANK_BRONZE end
    return COLOR_TEXT_PRIMARY
end

local function GetRankSuffix(rank)
    if rank == 1 then return "st" end
    if rank == 2 then return "nd" end
    if rank == 3 then return "rd" end
    return "th"
end

-----------------------------------------------------------
-- UI Construction
-----------------------------------------------------------

local function BuildUI()
    -- ScreenGui
    gui = Create("ScreenGui", {
        Name = "LeaderboardGui",
        ResetOnSpawn = false,
        ZIndexBehavior = Enum.ZIndexBehavior.Sibling,
        Enabled = true,
        Parent = playerGui,
    })

    -- Main Frame
    mainFrame = Create("Frame", {
        Name = "LeaderboardFrame",
        Size = LEADERBOARD_SIZE,
        Position = UDim2.new(0.5, 0, 0.4, 0), -- Start slightly above center for slide-in
        AnchorPoint = Vector2.new(0.5, 0.5),
        BackgroundColor3 = COLOR_BG,
        BorderSizePixel = 0,
        Visible = false,
        ZIndex = 10,
        Parent = gui,
    })

    Create("UICorner", {
        CornerRadius = UDim.new(0, 12),
        Parent = mainFrame,
    })

    Create("UIGradient", {
        Color = ColorSequence.new({
            ColorSequenceKeypoint.new(0, Color3.fromRGB(35, 35, 50)),
            ColorSequenceKeypoint.new(1, Color3.fromRGB(25, 25, 35)),
        }),
        Rotation = 90,
        Parent = mainFrame,
    })

    -- Shadow effect (behind main frame)
    local shadow = Create("ImageLabel", {
        Name = "Shadow",
        Size = UDim2.new(1, 40, 1, 40),
        Position = UDim2.new(0, -20, 0, -20),
        BackgroundTransparency = 1,
        Image = "rbxassetid://5554236805",
        ImageColor3 = Color3.fromRGB(0, 0, 0),
        ImageTransparency = 0.6,
        ScaleType = Enum.ScaleType.Slice,
        SliceCenter = Rect.new(23, 23, 277, 277),
        ZIndex = 9,
        Parent = mainFrame,
    })

    -- Header Frame
    local headerFrame = Create("Frame", {
        Name = "HeaderFrame",
        Size = UDim2.new(1, 0, 0, HEADER_HEIGHT),
        BackgroundColor3 = COLOR_HEADER,
        BorderSizePixel = 0,
        ZIndex = 11,
        Parent = mainFrame,
    })

    Create("UICorner", {
        CornerRadius = UDim.new(0, 12),
        Parent = headerFrame,
    })

    -- Fix header bottom corners
    local headerFix = Create("Frame", {
        Name = "HeaderFix",
        Size = UDim2.new(1, 0, 0, 12),
        Position = UDim2.new(0, 0, 1, -12),
        BackgroundColor3 = COLOR_HEADER,
        BorderSizePixel = 0,
        ZIndex = 11,
        Parent = headerFrame,
    })

    -- Title
    local titleLabel = Create("TextLabel", {
        Name = "TitleLabel",
        Size = UDim2.new(0.6, 0, 0, 36),
        Position = UDim2.new(0, 20, 0, 8),
        BackgroundTransparency = 1,
        Text = "🏆 Global Leaderboard",
        TextColor3 = COLOR_TEXT_PRIMARY,
        TextSize = 24,
        Font = Enum.Font.GothamBold,
        TextXAlignment = Enum.TextXAlignment.Left,
        ZIndex = 12,
        Parent = headerFrame,
    })

    -- Subtitle
    Create("TextLabel", {
        Name = "SubtitleLabel",
        Size = UDim2.new(0.6, 0, 0, 20),
        Position = UDim2.new(0, 20, 0, 42),
        BackgroundTransparency = 1,
        Text = "Top 10 Players Worldwide",
        TextColor3 = COLOR_TEXT_SECONDARY,
        TextSize = 13,
        Font = Enum.Font.Gotham,
        TextXAlignment = Enum.TextXAlignment.Left,
        ZIndex = 12,
        Parent = headerFrame,
    })

    -- Refresh Button
    refreshButton = Create("TextButton", {
        Name = "RefreshButton",
        Size = UDim2.new(0, 80, 0, 32),
        Position = UDim2.new(1, -100, 0, 19),
        AnchorPoint = Vector2.new(0, 0),
        BackgroundColor3 = COLOR_BUTTON_HOVER,
        Text = "🔄 Refresh",
        TextColor3 = COLOR_TEXT_PRIMARY,
        TextSize = 12,
        Font = Enum.Font.GothamSemibold,
        AutoButtonColor = false,
        ZIndex = 12,
        Parent = headerFrame,
    })

    Create("UICorner", {
        CornerRadius = UDim.new(0, 8),
        Parent = refreshButton,
    })

    -- Divider
    Create("Frame", {
        Name = "Divider",
        Size = UDim2.new(1, -20, 0, 1),
        Position = UDim2.new(0, 10, 0, HEADER_HEIGHT),
        BackgroundColor3 = Color3.fromRGB(60, 60, 75),
        BorderSizePixel = 0,
        ZIndex = 11,
        Parent = mainFrame,
    })

    -- Column Headers
    local columnHeaders = Create("Frame", {
        Name = "ColumnHeaders",
        Size = UDim2.new(1, -20, 0, 28),
        Position = UDim2.new(0, 10, 0, HEADER_HEIGHT + 6),
        BackgroundTransparency = 1,
        ZIndex = 11,
        Parent = mainFrame,
    })

    Create("TextLabel", {
        Name = "RankHeader",
        Size = UDim2.new(0, 60, 1, 0),
        Position = UDim2.new(0, 10, 0, 0),
        BackgroundTransparency = 1,
        Text = "RANK",
        TextColor3 = COLOR_ACCENT,
        TextSize = 12,
        Font = Enum.Font.GothamBold,
        TextXAlignment = Enum.TextXAlignment.Center,
        ZIndex = 12,
        Parent = columnHeaders,
    })

    Create("TextLabel", {
        Name = "PlayerHeader",
        Size = UDim2.new(0, 200, 1, 0),
        Position = UDim2.new(0, 80, 0, 0),
        BackgroundTransparency = 1,
        Text = "PLAYER",
        TextColor3 = COLOR_ACCENT,
        TextSize = 12,
        Font = Enum.Font.GothamBold,
        TextXAlignment = Enum.TextXAlignment.Left,
        ZIndex = 12,
        Parent = columnHeaders,
    })

    Create("TextLabel", {
        Name = "ScoreHeader",
        Size = UDim2.new(0, 120, 1, 0),
        Position = UDim2.new(1, -130, 0, 0),
        BackgroundTransparency = 1,
        Text = "SCORE",
        TextColor3 = COLOR_ACCENT,
        TextSize = 12,
        Font = Enum.Font.GothamBold,
        TextXAlignment = Enum.TextXAlignment.Right,
        ZIndex = 12,
        Parent = columnHeaders,
    })

    -- Entries Container (ScrollingFrame)
    entriesContainer = Create("ScrollingFrame", {
        Name = "EntriesContainer",
        Size = UDim2.new(1, -20, 1, -(HEADER_HEIGHT + FOOTER_HEIGHT + 50)),
        Position = UDim2.new(0, 10, 0, HEADER_HEIGHT + 38),
        BackgroundTransparency = 1,
        BorderSizePixel = 0,
        ScrollBarThickness = 4,
        ScrollBarImageColor3 = COLOR_ACCENT,
        ScrollBarImageTransparency = 0.5,
        CanvasSize = UDim2.new(0, 0, 0, 0),
        ZIndex = 11,
        Parent = mainFrame,
    })

    Create("UIListLayout", {
        Padding = UDim.new(0, 4),
        SortOrder = Enum.SortOrder.LayoutOrder,
        Parent = entriesContainer,
    })

    -- Entry Template (hidden, cloned for each entry)
    entryTemplate = Create("Frame", {
        Name = "EntryTemplate",
        Size = UDim2.new(1, 0, 0, ROW_HEIGHT),
        BackgroundColor3 = COLOR_ROW_ODD,
        BorderSizePixel = 0,
        Visible = false,
        ZIndex = 11,
    })

    Create("UICorner", {
        CornerRadius = UDim.new(0, 8),
        Parent = entryTemplate,
    })

    -- Rank background circle
    local rankBg = Create("Frame", {
        Name = "RankBg",
        Size = UDim2.new(0, 36, 0, 36),
        Position = UDim2.new(0, 12, 0.5, 0),
        AnchorPoint = Vector2.new(0, 0.5),
        BackgroundColor3 = COLOR_HEADER,
        BorderSizePixel = 0,
        ZIndex = 12,
        Parent = entryTemplate,
    })

    Create("UICorner", {
        CornerRadius = UDim.new(1, 0),
        Parent = rankBg,
    })

    Create("TextLabel", {
        Name = "RankLabel",
        Size = UDim2.new(1, 0, 1, 0),
        BackgroundTransparency = 1,
        Text = "1",
        TextColor3 = COLOR_RANK_GOLD,
        TextSize = 16,
        Font = Enum.Font.GothamBold,
        TextXAlignment = Enum.TextXAlignment.Center,
        TextYAlignment = Enum.TextYAlignment.Center,
        ZIndex = 13,
        Parent = rankBg,
    })

    -- Avatar
    local avatarFrame = Create("Frame", {
        Name = "AvatarFrame",
        Size = UDim2.new(0, 40, 0, 40),
        Position = UDim2.new(0, 58, 0.5, 0),
        AnchorPoint = Vector2.new(0, 0.5),
        BackgroundColor3 = COLOR_HEADER,
        BorderSizePixel = 0,
        ZIndex = 12,
        Parent = entryTemplate,
    })

    Create("UICorner", {
        CornerRadius = UDim.new(1, 0),
        Parent = avatarFrame,
    })

    Create("ImageLabel", {
        Name = "AvatarImage",
        Size = UDim2.new(1, -4, 1, -4),
        Position = UDim2.new(0, 2, 0, 2),
        BackgroundTransparency = 1,
        Image = "",
        ZIndex = 13,
        Parent = avatarFrame,
    })

    -- Player Name
    Create("TextLabel", {
        Name = "PlayerNameLabel",
        Size = UDim2.new(0, 180, 0, ROW_HEIGHT),
        Position = UDim2.new(0, 108, 0, 0),
        BackgroundTransparency = 1,
        Text = "PlayerName",
        TextColor3 = COLOR_TEXT_PRIMARY,
        TextSize = 15,
        Font = Enum.Font.GothamSemibold,
        TextXAlignment = Enum.TextXAlignment.Left,
        TextTruncate = Enum.TextTruncate.AtEnd,
        ZIndex = 12,
        Parent = entryTemplate,
    })

    -- Score
    Create("TextLabel", {
        Name = "ScoreLabel",
        Size = UDim2.new(0, 120, 0, ROW_HEIGHT),
        Position = UDim2.new(1, -130, 0, 0),
        BackgroundTransparency = 1,
        Text = "0",
        TextColor3 = COLOR_ACCENT,
        TextSize = 16,
        Font = Enum.Font.GothamBold,
        TextXAlignment = Enum.TextXAlignment.Right,
        ZIndex = 12,
        Parent = entryTemplate,
    })

    -- Loading Indicator
    loadingIndicator = Create("Frame", {
        Name = "LoadingIndicator",
        Size = UDim2.new(1, 0, 0, 100),
        Position = UDim2.new(0, 0, 0, HEADER_HEIGHT + 40),
        BackgroundTransparency = 1,
        Visible = false,
        ZIndex = 15,
        Parent = mainFrame,
    })

    Create("TextLabel", {
        Name = "LoadingText",
        Size = UDim2.new(1, 0, 1, 0),
        BackgroundTransparency = 1,
        Text = "⏳ Loading leaderboard data...",
        TextColor3 = COLOR_TEXT_SECONDARY,
        TextSize = 16,
        Font = Enum.Font.Gotham,
        TextXAlignment = Enum.TextXAlignment.Center,
        TextYAlignment = Enum.TextYAlignment.Center,
        ZIndex = 16,
        Parent = loadingIndicator,
    })

    -- Footer Frame
    local footerFrame = Create("Frame", {
        Name = "FooterFrame",
        Size = UDim2.new(1, 0, 0, FOOTER_HEIGHT),
        Position = UDim2.new(0, 0, 1, -FOOTER_HEIGHT),
        BackgroundColor3 = COLOR_HEADER,
        BorderSizePixel = 0,
        ZIndex = 11,
        Parent = mainFrame,
    })

    Create("UICorner", {
        CornerRadius = UDim.new(0, 12),
        Parent = footerFrame,
    })

    local footerFix = Create("Frame", {
        Name = "FooterFix",
        Size = UDim2.new(1, 0, 0, 12),
        Position = UDim2.new(0, 0, 0, 0),
        BackgroundColor3 = COLOR_HEADER,
        BorderSizePixel = 0,
        ZIndex = 11,
        Parent = footerFrame,
    })

    lastUpdatedLabel = Create("TextLabel", {
        Name = "LastUpdatedLabel",
        Size = UDim2.new(0.7, 0, 1, 0),
        Position = UDim2.new(0, 20, 0, 0),
        BackgroundTransparency = 1,
        Text = "Last updated: Never",
        TextColor3 = COLOR_TEXT_SECONDARY,
        TextSize = 11,
        Font = Enum.Font.Gotham,
        TextXAlignment = Enum.TextXAlignment.Left,
        ZIndex = 12,
        Parent = footerFrame,
    })

    -- Close Button
    closeButton = Create("TextButton", {
        Name = "CloseButton",
        Size = UDim2.new(0, 70, 0, 26),
        Position = UDim2.new(1, -90, 0, 5),
        BackgroundColor3 = COLOR_CLOSE_RED,
        Text = "✕ Close",
        TextColor3 = COLOR_TEXT_PRIMARY,
        TextSize = 12,
        Font = Enum.Font.GothamSemibold,
        AutoButtonColor = false,
        ZIndex = 12,
        Parent = footerFrame,
    })

    Create("UICorner", {
        CornerRadius = UDim.new(0, 6),
        Parent = closeButton,
    })

    -- Open Button (when leaderboard is closed)
    openButton = Create("TextButton", {
        Name = "OpenButton",
        Size = UDim2.new(0, 160, 0, 44),
        Position = UDim2.new(0, 20, 0.5, -22),
        BackgroundColor3 = COLOR_HEADER,
        Text = "🏆 Leaderboard",
        TextColor3 = COLOR_ACCENT,
        TextSize = 16,
        Font = Enum.Font.GothamBold,
        AutoButtonColor = false,
        Visible = true,
        ZIndex = 5,
        Parent = gui,
    })

    Create("UICorner", {
        CornerRadius = UDim.new(0, 10),
        Parent = openButton,
    })

    -- Open button shadow
    Create("ImageLabel", {
        Name = "OpenShadow",
        Size = UDim2.new(1, 20, 1, 20),
        Position = UDim2.new(0, -10, 0, -10),
        BackgroundTransparency = 1,
        Image = "rbxassetid://5554236805",
        ImageColor3 = Color3.fromRGB(0, 0, 0),
        ImageTransparency = 0.7,
        ScaleType = Enum.ScaleType.Slice,
        SliceCenter = Rect.new(23, 23, 277, 277),
        ZIndex = 4,
        Parent = openButton,
    })
end

-----------------------------------------------------------
-- Entry Management
-----------------------------------------------------------

local function ClearEntries()
    for _, entry in ipairs(currentEntries) do
        Tween(entry, {BackgroundTransparency = 1})
        task.delay(TWEEN_DURATION, function()
            if entry and entry.Parent then
                entry:Destroy()
            end
        end)
    end
    currentEntries = {}
end

local function CreateEntry(rank, playerName, score, userId, isLocalPlayer)
    local entry = entryTemplate:Clone()
    entry.Name = "Entry_" .. rank
    entry.Visible = true
    entry.LayoutOrder = rank
    entry.BackgroundTransparency = 0

    -- Alternate row colors
    if rank % 2 == 0 then
        entry.BackgroundColor3 = COLOR_ROW_EVEN
    else
        entry.BackgroundColor3 = COLOR_ROW_ODD
    end

    -- Highlight local player
    if isLocalPlayer then
        entry.BackgroundColor3 = Color3.fromRGB(55, 50, 35)
        local stroke = Instance.new("UIStroke")
        stroke.Color = COLOR_HIGHLIGHT
        stroke.Thickness = 2
        stroke.Transparency = 0.3
        stroke.Parent = entry
    end

    -- Rank
    local rankBg = entry:FindFirstChild("RankBg")
    if rankBg then
        local rankLabel = rankBg:FindFirstChild("RankLabel")
        if rankLabel then
            rankLabel.Text = tostring(rank) .. GetRankSuffix(rank)
            rankLabel.TextColor3 = GetRankColor(rank)
        end
    end

    -- Avatar
    local avatarImage = entry:FindFirstChild("AvatarFrame")
    if avatarImage then
        local imgLabel = avatarImage:FindFirstChild("AvatarImage")
        if imgLabel and userId then
            imgLabel.Image = "rbxthumb://type=AvatarHeadShot&id=" .. userId .. "&w=48&h=48"
        else
            imgLabel.Image = "rbxassetid://0"
        end
    end

    -- Player Name
    local nameLabel = entry:FindFirstChild("PlayerNameLabel")
    if nameLabel then
        nameLabel.Text = playerName
        if isLocalPlayer then
            nameLabel.Text = playerName .. " (YOU)"
            nameLabel.TextColor3 = COLOR_HIGHLIGHT
        end
    end

    -- Score
    local scoreLabel = entry:FindFirstChild("ScoreLabel")
    if scoreLabel then
        scoreLabel.Text = FormatNumber(score)
    end

    entry.Parent = entriesContainer
    table.insert(currentEntries, entry)

    -- Animate entry in
    entry.Size = UDim2.new(0.9, 0, 0, ROW_HEIGHT)
    entry.BackgroundTransparency = 1

    task.delay((rank - 1) * STAGGER_DELAY, function()
        if entry and entry.Parent then
            Tween(entry, {
                Size = UDim2.new(1, 0, 0, ROW_HEIGHT),
                BackgroundTransparency = 0,
            }, tweenInfoSlide)
        end
    end)
end

-----------------------------------------------------------
-- Data Loading
-----------------------------------------------------------

local function UpdateLeaderboard(data)
    -- Clear existing entries
    ClearEntries()

    -- Hide loading
    loadingIndicator.Visible = false

    if not data or #data == 0 then
        -- Show "no data" message
        local noDataLabel = Create("TextLabel", {
            Name = "NoDataLabel",
            Size = UDim2.new(1, 0, 0, 100),
            BackgroundTransparency = 1,
            Text = "📭 No data yet. Be the first to set a score!",
            TextColor3 = COLOR_TEXT_SECONDARY,
            TextSize = 15,
            Font = Enum.Font.Gotham,
            TextXAlignment = Enum.TextXAlignment.Center,
            TextYAlignment = Enum.TextYAlignment.Center,
            ZIndex = 14,
            Parent = entriesContainer,
        })
        table.insert(currentEntries, noDataLabel)
        entriesContainer.CanvasSize = UDim2.new(0, 0, 0, 120)
        return
    end

    -- Create entries
    for i, entryData in ipairs(data) do
        if i > 10 then break end
        local isLocalPlayer = entryData.UserId == player.UserId
        CreateEntry(
            i,
            entryData.DisplayName or entryData.Name or "Unknown",
            entryData.Score or 0,
            entryData.UserId,
            isLocalPlayer
        )
    end

    -- Update canvas size
    local contentHeight = math.min(#data, 10) * (ROW_HEIGHT + 4)
    entriesContainer.CanvasSize = UDim2.new(0, 0, 0, contentHeight)

    -- Update timestamp
    lastRefreshTime = os.time()
    lastUpdatedLabel.Text = "Last updated: " .. os.date("%H:%M:%S", lastRefreshTime)
end

local function RefreshLeaderboard()
    -- Prevent spam refreshing
    local timeSinceLastRefresh = os.time() - lastRefreshTime
    if timeSinceLastRefresh < 5 then
        return
    end

    -- Show loading
    loadingIndicator.Visible = true

    -- Request data from server
    local success, data = pcall(function()
        return GetLeaderboardData:InvokeServer()
    end)

    if success and data then
        UpdateLeaderboard(data)
    else
        loadingIndicator.Visible = false
        warn("[Leaderboard] Failed to refresh: " .. tostring(data))

        -- Show error message
        ClearEntries()
        local errorLabel = Create("TextLabel", {
            Name = "ErrorLabel",
            Size = UDim2.new(1, 0, 0, 100),
            BackgroundTransparency = 1,
            Text = "❌ Failed to load data. Try again.",
            TextColor3 = Color3.fromRGB(255, 100, 100),
            TextSize = 15,
            Font = Enum.Font.Gotham,
            TextXAlignment = Enum.TextXAlignment.Center,
            TextYAlignment = Enum.TextYAlignment.Center,
            ZIndex = 14,
            Parent = entriesContainer,
        })
        table.insert(currentEntries, errorLabel)
    end
end

-----------------------------------------------------------
-- Visibility Toggle
-----------------------------------------------------------

local function ShowLeaderboard()
    if isVisible then return end
    isVisible = true

    mainFrame.Visible = true
    openButton.Visible = false

    -- Slide in animation
    mainFrame.Position = UDim2.new(0.5, 0, 0.35, 0)
    mainFrame.BackgroundTransparency = 1

    Tween(mainFrame, {
        Position = LEADERBOARD_POSITION,
        BackgroundTransparency = 0,
    }, tweenInfoSlide)

    -- Fade in shadow
    local shadow = mainFrame:FindFirstChild("Shadow")
    if shadow then
        shadow.ImageTransparency = 1
        Tween(shadow, {ImageTransparency = 0.6}, tweenInfoFade)
    end

    -- Refresh data on open
    RefreshLeaderboard()
end

local function HideLeaderboard()
    if not isVisible then return end
    isVisible = false

    -- Fade out animation
    Tween(mainFrame, {
        Position = UDim2.new(0.5, 0, 0.35, 0),
        BackgroundTransparency = 1,
    }, tweenInfoFade)

    -- Fade out shadow
    local shadow = mainFrame:FindFirstChild("Shadow")
    if shadow then
        Tween(shadow, {ImageTransparency = 1}, tweenInfoFade)
    end

    task.delay(TWEEN_DURATION, function()
        mainFrame.Visible = false
        openButton.Visible = true

        -- Pop in animation for open button
        openButton.Size = UDim2.new(0, 0, 0, 0)
        Tween(openButton, {
            Size = UDim2.new(0, 160, 0, 44),
        }, tweenInfoScale)
    end)
end

-----------------------------------------------------------
-- Button Interactions
-----------------------------------------------------------

local function SetupButtonAnimations()
    -- Refresh button hover
    refreshButton.MouseEnter:Connect(function()
        Tween(refreshButton, {BackgroundColor3 = COLOR_ACCENT})
        refreshButton.TextColor3 = COLOR_BG
    end)

    refreshButton.MouseLeave:Connect(function()
        Tween(refreshButton, {BackgroundColor3 = COLOR_BUTTON_HOVER})
        refreshButton.TextColor3 = COLOR_TEXT_PRIMARY
    end)

    refreshButton.MouseButton1Click:Connect(function()
        -- Spin animation
        local originalRotation = refreshButton.Rotation
        Tween(refreshButton, {Rotation = 360}, TweenInfo.new(0.5, Enum.EasingStyle.Quad, Enum.EasingDirection.Out))
        task.delay(0.5, function()
            refreshButton.Rotation = 0
        end)
        RefreshLeaderboard()
    end)

    -- Close button hover
    closeButton.MouseEnter:Connect(function()
        Tween(closeButton, {BackgroundColor3 = Color3.fromRGB(255, 80, 80)})
    end)

    closeButton.MouseLeave:Connect(function()
        Tween(closeButton, {BackgroundColor3 = COLOR_CLOSE_RED})
    end)

    closeButton.MouseButton1Click:Connect(HideLeaderboard)

    -- Open button hover
    openButton.MouseEnter:Connect(function()
        Tween(openButton, {BackgroundColor3 = Color3.fromRGB(60, 65, 90)})
        Tween(openButton, {Size = UDim2.new(0, 170, 0, 48)})
    end)

    openButton.MouseLeave:Connect(function()
        Tween(openButton, {BackgroundColor3 = COLOR_HEADER})
        Tween(openButton, {Size = UDim2.new(0, 160, 0, 44)})
    end)

    openButton.MouseButton1Click:Connect(ShowLeaderboard)
end

-----------------------------------------------------------
-- Auto Refresh
-----------------------------------------------------------

local function StartAutoRefresh()
    if refreshConnection then
        refreshConnection:Disconnect()
    end

    refreshConnection = task.spawn(function()
        while true do
            task.wait(REFRESH_INTERVAL)
            if isVisible then
                RefreshLeaderboard()
            end
        end
    end)
end

-----------------------------------------------------------
-- Keyboard Shortcut
-----------------------------------------------------------

local function SetupKeyboardShortcut()
    local UserInputService = game:GetService("UserInputService")

    UserInputService.InputBegan:Connect(function(input, gameProcessed)
        if gameProcessed then return end
        if input.KeyCode == Enum.KeyCode.L then
            if isVisible then
                HideLeaderboard()
            else
                ShowLeaderboard()
            end
        end
    end)
end

-----------------------------------------------------------
-- Initialization
-----------------------------------------------------------

local function Initialize()
    BuildUI()
    SetupButtonAnimations()
    StartAutoRefresh()
    SetupKeyboardShortcut()

    -- Listen for server-pushed updates
    RefreshEvent.OnClientEvent:Connect(function(data)
        if isVisible then
            UpdateLeaderboard(data)
        end
    end)

    print("[Leaderboard] Global Leaderboard initialized. Press 'L' to toggle.")
end

-- Wait for player to be ready
if player.Character then
    Initialize()
else
    player.CharacterAdded:Wait()
    Initialize()
end
