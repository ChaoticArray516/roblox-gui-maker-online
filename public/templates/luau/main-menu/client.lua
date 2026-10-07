--[[
    Main Menu System - Client
    Features: Animated play button, settings, store, social links, auto-fit layout
    Place in: StarterGui > MainMenuGui
--]]

local Players = game:GetService("Players")
local TweenService = game:GetService("TweenService")
local UserInputService = game:GetService("UserInputService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local TeleportService = game:GetService("TeleportService")
local RunService = game:GetService("RunService")
local MarketplaceService = game:GetService("MarketplaceService")

local player = Players.LocalPlayer
local playerGui = player:WaitForChild("PlayerGui")

-- ============================================
-- CONFIGURATION
-- ============================================
local CONFIG = {
    AnimSpeed = 0.35,
    BounceSpeed = 0.5,
    GradientSpeed = 0.02,
    ButtonHoverScale = 1.05,
    LogoBobSpeed = 2,
    LogoBobAmount = 8,
    SocialIds = {
        Discord = "",
        Twitter = "",
        YouTube = "",
        RobloxGroup = "",
    },
    GamepassIds = {},
    DeveloperProductIds = {},
}

-- ============================================
-- UTILITY FUNCTIONS
-- ============================================
local function Create(className, properties)
    local instance = Instance.new(className)
    for key, value in pairs(properties or {}) do
        instance[key] = value
    end
    return instance
end

local function Tween(instance, properties, duration, easingStyle, easingDirection)
    local tween = TweenService:Create(
        instance,
        TweenInfo.new(
            duration or CONFIG.AnimSpeed,
            easingStyle or Enum.EasingStyle.Quad,
            easingDirection or Enum.EasingDirection.Out
        ),
        properties
    )
    tween:Play()
    return tween
end

local function TweenBounce(instance, properties, duration)
    return Tween(instance, properties, duration, Enum.EasingStyle.Back, Enum.EasingDirection.Out)
end

local function PlaySound(soundId, volume)
    local sound = Instance.new("Sound")
    sound.SoundId = soundId
    sound.Volume = volume or 0.5
    sound.Parent = playerGui
    sound:Play()
    task.delay(sound.TimeLength + 0.5, function()
        sound:Destroy()
    end)
end

-- ============================================
-- UI CONSTRUCTION
-- ============================================
local UI = {}

function UI.Build()
    -- ScreenGui
    local screenGui = Create("ScreenGui", {
        Name = "MainMenuGui",
        Parent = playerGui,
        ResetOnSpawn = false,
        ZIndexBehavior = Enum.ZIndexBehavior.Sibling,
        IgnoreGuiInset = true,
    })
    UI.ScreenGui = screenGui

    -- Background Frame (Full Screen)
    local bgFrame = Create("Frame", {
        Name = "BackgroundFrame",
        Parent = screenGui,
        Size = UDim2.new(1, 0, 1, 0),
        BackgroundColor3 = Color3.fromRGB(20, 22, 35),
        BorderSizePixel = 0,
        ZIndex = 1,
    })

    -- Animated Gradient Background
    local bgGradient = Create("UIGradient", {
        Color = ColorSequence.new({
            ColorSequenceKeypoint.new(0, Color3.fromRGB(25, 28, 50)),
            ColorSequenceKeypoint.new(0.3, Color3.fromRGB(35, 25, 55)),
            ColorSequenceKeypoint.new(0.6, Color3.fromRGB(25, 35, 55)),
            ColorSequenceKeypoint.new(1, Color3.fromRGB(20, 30, 45)),
        }),
        Rotation = 45,
        Parent = bgFrame,
    })

    -- Floating particles (simulated with small frames)
    UI.Particles = {}
    for i = 1, 15 do
        local particle = Create("Frame", {
            Name = "Particle_" .. i,
            Parent = bgFrame,
            Size = UDim2.new(0, math.random(2, 6), 0, math.random(2, 6)),
            Position = UDim2.new(math.random(), 0, math.random(), 0),
            BackgroundColor3 = Color3.fromRGB(
                math.random(100, 200),
                math.random(120, 220),
                math.random(180, 255)
            ),
            BackgroundTransparency = math.random(40, 70) / 100,
            BorderSizePixel = 0,
            ZIndex = 2,
        })
        Create("UICorner", {
            CornerRadius = UDim.new(1, 0),
            Parent = particle,
        })
        table.insert(UI.Particles, {
            Frame = particle,
            Speed = math.random(5, 15) / 1000,
            Direction = math.random() > 0.5 and 1 or -1,
        })
    end

    -- Content Frame (Centered)
    local contentFrame = Create("Frame", {
        Name = "ContentFrame",
        Parent = screenGui,
        AnchorPoint = Vector2.new(0.5, 0.5),
        Position = UDim2.new(0.5, 0, 0.48, 0),
        Size = UDim2.new(0, 450, 0, 520),
        BackgroundTransparency = 1,
        ZIndex = 10,
    })
    UI.ContentFrame = contentFrame

    -- Game Logo
    UI.GameLogo = Create("ImageLabel", {
        Name = "GameLogo",
        Parent = contentFrame,
        AnchorPoint = Vector2.new(0.5, 0),
        Position = UDim2.new(0.5, 0, 0, 0),
        Size = UDim2.new(0, 180, 0, 180),
        BackgroundTransparency = 1,
        Image = "rbxassetid://0", -- Replace with your game logo
        ZIndex = 11,
    })
    Create("UICorner", {
        CornerRadius = UDim.new(0, 20),
        Parent = UI.GameLogo,
    })
    -- Logo glow
    local logoStroke = Create("UIStroke", {
        Color = Color3.fromRGB(100, 150, 255),
        Thickness = 3,
        Transparency = 0.3,
        Parent = UI.GameLogo,
    })
    UI.LogoStroke = logoStroke

    -- Game Title
    UI.GameTitle = Create("TextLabel", {
        Name = "GameTitle",
        Parent = contentFrame,
        AnchorPoint = Vector2.new(0.5, 0),
        Position = UDim2.new(0.5, 0, 0, 190),
        Size = UDim2.new(1, 0, 0, 50),
        BackgroundTransparency = 1,
        Text = "GAME TITLE",
        TextColor3 = Color3.fromRGB(255, 255, 255),
        TextSize = 42,
        Font = Enum.Font.GothamBlack,
        TextStrokeTransparency = 0.8,
        TextStrokeColor3 = Color3.fromRGB(50, 100, 200),
        ZIndex = 11,
    })

    -- Subtitle
    UI.Subtitle = Create("TextLabel", {
        Name = "Subtitle",
        Parent = contentFrame,
        AnchorPoint = Vector2.new(0.5, 0),
        Position = UDim2.new(0.5, 0, 0, 242),
        Size = UDim2.new(1, 0, 0, 28),
        BackgroundTransparency = 1,
        Text = "Your Adventure Begins Here",
        TextColor3 = Color3.fromRGB(160, 170, 200),
        TextSize = 18,
        Font = Enum.Font.GothamSemibold,
        ZIndex = 11,
    })

    -- Button Container
    local buttonContainer = Create("Frame", {
        Name = "ButtonContainer",
        Parent = contentFrame,
        AnchorPoint = Vector2.new(0.5, 0),
        Position = UDim2.new(0.5, 0, 0, 285),
        Size = UDim2.new(0, 300, 0, 260),
        BackgroundTransparency = 1,
        ZIndex = 11,
    })
    Create("UIListLayout", {
        FillDirection = Enum.FillDirection.Vertical,
        HorizontalAlignment = Enum.HorizontalAlignment.Center,
        VerticalAlignment = Enum.VerticalAlignment.Top,
        Padding = UDim.new(0, 10),
        Parent = buttonContainer,
    })

    -- Play Button (Primary - larger, animated)
    local playButton = Create("TextButton", {
        Name = "PlayButton",
        Parent = buttonContainer,
        Size = UDim2.new(0, 280, 0, 55),
        BackgroundColor3 = Color3.fromRGB(50, 180, 80),
        Text = "PLAY",
        TextColor3 = Color3.fromRGB(255, 255, 255),
        TextSize = 26,
        Font = Enum.Font.GothamBlack,
        ZIndex = 12,
    })
    Create("UICorner", {CornerRadius = UDim.new(0, 12), Parent = playButton})
    local playGradient = Create("UIGradient", {
        Color = ColorSequence.new({
            ColorSequenceKeypoint.new(0, Color3.fromRGB(50, 200, 90)),
            ColorSequenceKeypoint.new(1, Color3.fromRGB(40, 160, 70)),
        }),
        Rotation = 90,
        Parent = playButton,
    })
    local playStroke = Create("UIStroke", {
        Color = Color3.fromRGB(80, 230, 110),
        Thickness = 2,
        Transparency = 0.3,
        Parent = playButton,
    })
    UI.PlayButton = playButton
    UI.PlayGradient = playGradient
    UI.PlayStroke = playStroke

    -- Store Button
    local storeButton = Create("TextButton", {
        Name = "StoreButton",
        Parent = buttonContainer,
        Size = UDim2.new(0, 260, 0, 44),
        BackgroundColor3 = Color3.fromRGB(200, 160, 50),
        Text = "   STORE",
        TextColor3 = Color3.fromRGB(255, 255, 255),
        TextSize = 20,
        Font = Enum.Font.GothamBold,
        ZIndex = 12,
    })
    Create("UICorner", {CornerRadius = UDim.new(0, 10), Parent = storeButton})
    Create("UIGradient", {
        Color = ColorSequence.new({
            ColorSequenceKeypoint.new(0, Color3.fromRGB(220, 175, 55)),
            ColorSequenceKeypoint.new(1, Color3.fromRGB(180, 140, 45)),
        }),
        Rotation = 90,
        Parent = storeButton,
    })
    Create("UIStroke", {
        Color = Color3.fromRGB(240, 200, 80),
        Thickness = 1,
        Transparency = 0.5,
        Parent = storeButton,
    })
    UI.StoreButton = storeButton

    -- Settings Button
    local settingsButton = Create("TextButton", {
        Name = "SettingsButton",
        Parent = buttonContainer,
        Size = UDim2.new(0, 260, 0, 44),
        BackgroundColor3 = Color3.fromRGB(80, 90, 130),
        Text = "   SETTINGS",
        TextColor3 = Color3.fromRGB(255, 255, 255),
        TextSize = 20,
        Font = Enum.Font.GothamBold,
        ZIndex = 12,
    })
    Create("UICorner", {CornerRadius = UDim.new(0, 10), Parent = settingsButton})
    Create("UIGradient", {
        Color = ColorSequence.new({
            ColorSequenceKeypoint.new(0, Color3.fromRGB(90, 100, 150)),
            ColorSequenceKeypoint.new(1, Color3.fromRGB(70, 80, 110)),
        }),
        Rotation = 90,
        Parent = settingsButton,
    })
    UI.SettingsButton = settingsButton

    -- Leaderboards Button
    local leaderboardsButton = Create("TextButton", {
        Name = "LeaderboardsButton",
        Parent = buttonContainer,
        Size = UDim2.new(0, 260, 0, 44),
        BackgroundColor3 = Color3.fromRGB(130, 70, 150),
        Text = "   LEADERBOARDS",
        TextColor3 = Color3.fromRGB(255, 255, 255),
        TextSize = 20,
        Font = Enum.Font.GothamBold,
        ZIndex = 12,
    })
    Create("UICorner", {CornerRadius = UDim.new(0, 10), Parent = leaderboardsButton})
    Create("UIGradient", {
        Color = ColorSequence.new({
            ColorSequenceKeypoint.new(0, Color3.fromRGB(150, 80, 170)),
            ColorSequenceKeypoint.new(1, Color3.fromRGB(110, 60, 130)),
        }),
        Rotation = 90,
        Parent = leaderboardsButton,
    })
    UI.LeaderboardsButton = leaderboardsButton

    -- Codes Button
    local codesButton = Create("TextButton", {
        Name = "CodesButton",
        Parent = buttonContainer,
        Size = UDim2.new(0, 260, 0, 44),
        BackgroundColor3 = Color3.fromRGB(50, 130, 140),
        Text = "   CODES",
        TextColor3 = Color3.fromRGB(255, 255, 255),
        TextSize = 20,
        Font = Enum.Font.GothamBold,
        ZIndex = 12,
    })
    Create("UICorner", {CornerRadius = UDim.new(0, 10), Parent = codesButton})
    Create("UIGradient", {
        Color = ColorSequence.new({
            ColorSequenceKeypoint.new(0, Color3.fromRGB(55, 145, 155)),
            ColorSequenceKeypoint.new(1, Color3.fromRGB(45, 115, 125)),
        }),
        Rotation = 90,
        Parent = codesButton,
    })
    UI.CodesButton = codesButton

    -- Social Container
    local socialContainer = Create("Frame", {
        Name = "SocialContainer",
        Parent = screenGui,
        AnchorPoint = Vector2.new(0.5, 1),
        Position = UDim2.new(0.5, 0, 1, -25),
        Size = UDim2.new(0, 250, 0, 44),
        BackgroundTransparency = 1,
        ZIndex = 20,
    })
    Create("UIListLayout", {
        FillDirection = Enum.FillDirection.Horizontal,
        HorizontalAlignment = Enum.HorizontalAlignment.Center,
        VerticalAlignment = Enum.VerticalAlignment.Center,
        Padding = UDim.new(0, 12),
        Parent = socialContainer,
    })

    -- Social buttons
    local socialPlatforms = {
        {Name = "Discord", Color = Color3.fromRGB(88, 101, 242), Icon = "rbxassetid://0"},
        {Name = "Twitter", Color = Color3.fromRGB(29, 161, 242), Icon = "rbxassetid://0"},
        {Name = "YouTube", Color = Color3.fromRGB(255, 0, 0), Icon = "rbxassetid://0"},
        {Name = "RobloxGroup", Color = Color3.fromRGB(226, 30, 112), Icon = "rbxassetid://0"},
    }
    UI.SocialButtons = {}
    for _, platform in ipairs(socialPlatforms) do
        local btn = Create("ImageButton", {
            Name = platform.Name .. "Button",
            Parent = socialContainer,
            Size = UDim2.new(0, 40, 0, 40),
            BackgroundColor3 = platform.Color,
            Image = platform.Icon,
            ZIndex = 21,
        })
        Create("UICorner", {CornerRadius = UDim.new(0, 10), Parent = btn})
        UI.SocialButtons[platform.Name] = btn
    end

    -- Version Label (Bottom right corner)
    Create("TextLabel", {
        Name = "VersionLabel",
        Parent = screenGui,
        AnchorPoint = Vector2.new(1, 1),
        Position = UDim2.new(1, -10, 1, -5),
        Size = UDim2.new(0, 120, 0, 20),
        BackgroundTransparency = 1,
        Text = "v1.0.0",
        TextColor3 = Color3.fromRGB(100, 100, 120),
        TextSize = 12,
        Font = Enum.Font.Gotham,
        TextXAlignment = Enum.TextXAlignment.Right,
        ZIndex = 20,
    })

    -- ========== SETTINGS PANEL ==========
    local settingsPanel = Create("Frame", {
        Name = "SettingsPanel",
        Parent = screenGui,
        AnchorPoint = Vector2.new(0.5, 0.5),
        Position = UDim2.new(0.5, 0, 0.5, 0),
        Size = UDim2.new(0, 400, 0, 450),
        BackgroundColor3 = Color3.fromRGB(30, 32, 48),
        BorderSizePixel = 0,
        Visible = false,
        ZIndex = 100,
    })
    UI.SettingsPanel = settingsPanel
    Create("UICorner", {CornerRadius = UDim.new(0, 16), Parent = settingsPanel})
    Create("UIStroke", {
        Color = Color3.fromRGB(80, 85, 120),
        Thickness = 2,
        Parent = settingsPanel,
    })

    -- Settings header
    local settingsHeader = Create("Frame", {
        Name = "Header",
        Parent = settingsPanel,
        Size = UDim2.new(1, 0, 0, 55),
        BackgroundColor3 = Color3.fromRGB(38, 40, 58),
        BorderSizePixel = 0,
        ZIndex = 101,
    })
    Create("UICorner", {CornerRadius = UDim.new(0, 16), Parent = settingsHeader})
    Create("TextLabel", {
        Name = "Title",
        Parent = settingsHeader,
        Position = UDim2.new(0, 20, 0, 0),
        Size = UDim2.new(1, -60, 1, 0),
        BackgroundTransparency = 1,
        Text = "SETTINGS",
        TextColor3 = Color3.fromRGB(255, 255, 255),
        TextSize = 24,
        Font = Enum.Font.GothamBold,
        TextXAlignment = Enum.TextXAlignment.Left,
        ZIndex = 102,
    })
    local settingsClose = Create("TextButton", {
        Name = "CloseButton",
        Parent = settingsHeader,
        Position = UDim2.new(1, -45, 0, 10),
        Size = UDim2.new(0, 35, 0, 35),
        BackgroundColor3 = Color3.fromRGB(180, 50, 50),
        Text = "X",
        TextColor3 = Color3.fromRGB(255, 255, 255),
        TextSize = 20,
        Font = Enum.Font.GothamBold,
        ZIndex = 102,
    })
    Create("UICorner", {CornerRadius = UDim.new(0, 8), Parent = settingsClose})

    -- Settings list
    local settingsList = Create("ScrollingFrame", {
        Name = "SettingsList",
        Parent = settingsPanel,
        Position = UDim2.new(0, 15, 0, 65),
        Size = UDim2.new(1, -30, 1, -80),
        BackgroundTransparency = 1,
        ScrollBarThickness = 6,
        CanvasSize = UDim2.new(0, 0, 0, 300),
        ZIndex = 101,
    })
    Create("UIListLayout", {
        Padding = UDim.new(0, 10),
        Parent = settingsList,
    })

    -- Create toggle settings
    local function CreateToggleSetting(name, label, defaultValue)
        local row = Create("Frame", {
            Name = name,
            Parent = settingsList,
            Size = UDim2.new(1, 0, 0, 50),
            BackgroundColor3 = Color3.fromRGB(38, 40, 55),
            BorderSizePixel = 0,
            ZIndex = 102,
        })
        Create("UICorner", {CornerRadius = UDim.new(0, 10), Parent = row})
        Create("TextLabel", {
            Parent = row,
            Position = UDim2.new(0, 15, 0, 0),
            Size = UDim2.new(0.6, 0, 1, 0),
            BackgroundTransparency = 1,
            Text = label,
            TextColor3 = Color3.fromRGB(220, 220, 240),
            TextSize = 16,
            Font = Enum.Font.GothamSemibold,
            TextXAlignment = Enum.TextXAlignment.Left,
            ZIndex = 103,
        })
        local toggleBtn = Create("TextButton", {
            Name = "Toggle",
            Parent = row,
            Position = UDim2.new(1, -65, 0.5, -15),
            Size = UDim2.new(0, 50, 0, 30),
            BackgroundColor3 = defaultValue and Color3.fromRGB(50, 180, 80) or Color3.fromRGB(100, 100, 120),
            Text = defaultValue and "ON" or "OFF",
            TextColor3 = Color3.fromRGB(255, 255, 255),
            TextSize = 14,
            Font = Enum.Font.GothamBold,
            ZIndex = 103,
        })
        Create("UICorner", {CornerRadius = UDim.new(0, 15), Parent = toggleBtn})
        return toggleBtn
    end

    UI.MusicToggle = CreateToggleSetting("MusicToggle", "Background Music", true)
    UI.SFXToggle = CreateToggleSetting("SFXToggle", "Sound Effects", true)

    -- ========== CODES PANEL ==========
    local codesPanel = Create("Frame", {
        Name = "CodesPanel",
        Parent = screenGui,
        AnchorPoint = Vector2.new(0.5, 0.5),
        Position = UDim2.new(0.5, 0, 0.5, 0),
        Size = UDim2.new(0, 380, 0, 250),
        BackgroundColor3 = Color3.fromRGB(30, 32, 48),
        BorderSizePixel = 0,
        Visible = false,
        ZIndex = 100,
    })
    UI.CodesPanel = codesPanel
    Create("UICorner", {CornerRadius = UDim.new(0, 16), Parent = codesPanel})
    Create("UIStroke", {
        Color = Color3.fromRGB(80, 85, 120),
        Thickness = 2,
        Parent = codesPanel,
    })
    Create("TextLabel", {
        Parent = codesPanel,
        Position = UDim2.new(0, 0, 0, 15),
        Size = UDim2.new(1, 0, 0, 35),
        BackgroundTransparency = 1,
        Text = "REDEEM CODE",
        TextColor3 = Color3.fromRGB(255, 255, 255),
        TextSize = 22,
        Font = Enum.Font.GothamBold,
        ZIndex = 101,
    })
    local codeInput = Create("TextBox", {
        Name = "CodeInput",
        Parent = codesPanel,
        Position = UDim2.new(0.5, -130, 0, 65),
        Size = UDim2.new(0, 260, 0, 42),
        BackgroundColor3 = Color3.fromRGB(45, 47, 65),
        Text = "",
        PlaceholderText = "Enter code here...",
        TextColor3 = Color3.fromRGB(255, 255, 255),
        PlaceholderColor3 = Color3.fromRGB(120, 120, 140),
        TextSize = 16,
        Font = Enum.Font.Gotham,
        ClearTextOnFocus = true,
        ZIndex = 101,
    })
    Create("UICorner", {CornerRadius = UDim.new(0, 10), Parent = codeInput})
    local redeemBtn = Create("TextButton", {
        Name = "RedeemButton",
        Parent = codesPanel,
        Position = UDim2.new(0.5, -80, 0, 125),
        Size = UDim2.new(0, 160, 0, 42),
        BackgroundColor3 = Color3.fromRGB(50, 180, 80),
        Text = "REDEEM",
        TextColor3 = Color3.fromRGB(255, 255, 255),
        TextSize = 18,
        Font = Enum.Font.GothamBold,
        ZIndex = 101,
    })
    Create("UICorner", {CornerRadius = UDim.new(0, 10), Parent = redeemBtn})
    UI.RedeemButton = redeemBtn
    UI.CodeInput = codeInput
    local codeClose = Create("TextButton", {
        Name = "CloseButton",
        Parent = codesPanel,
        Position = UDim2.new(1, -45, 0, 10),
        Size = UDim2.new(0, 35, 0, 35),
        BackgroundColor3 = Color3.fromRGB(180, 50, 50),
        Text = "X",
        TextColor3 = Color3.fromRGB(255, 255, 255),
        TextSize = 20,
        Font = Enum.Font.GothamBold,
        ZIndex = 101,
    })
    Create("UICorner", {CornerRadius = UDim.new(0, 8), Parent = codeClose})

    -- ========== LOADING OVERLAY ==========
    local loadingOverlay = Create("Frame", {
        Name = "LoadingOverlay",
        Parent = screenGui,
        Size = UDim2.new(1, 0, 1, 0),
        BackgroundColor3 = Color3.fromRGB(15, 15, 25),
        BorderSizePixel = 0,
        Visible = false,
        ZIndex = 500,
    })
    UI.LoadingOverlay = loadingOverlay
    Create("TextLabel", {
        Name = "LoadingText",
        Parent = loadingOverlay,
        AnchorPoint = Vector2.new(0.5, 0.5),
        Position = UDim2.new(0.5, 0, 0.42, 0),
        Size = UDim2.new(0, 300, 0, 40),
        BackgroundTransparency = 1,
        Text = "Loading...",
        TextColor3 = Color3.fromRGB(255, 255, 255),
        TextSize = 28,
        Font = Enum.Font.GothamBold,
        ZIndex = 501,
    })
    local loadingBarBg = Create("Frame", {
        Name = "LoadingBarBg",
        Parent = loadingOverlay,
        AnchorPoint = Vector2.new(0.5, 0.5),
        Position = UDim2.new(0.5, 0, 0.52, 0),
        Size = UDim2.new(0, 300, 0, 12),
        BackgroundColor3 = Color3.fromRGB(40, 40, 60),
        BorderSizePixel = 0,
        ZIndex = 501,
    })
    Create("UICorner", {CornerRadius = UDim.new(0, 6), Parent = loadingBarBg})
    UI.LoadingBar = Create("Frame", {
        Name = "LoadingBar",
        Parent = loadingBarBg,
        Size = UDim2.new(0, 0, 1, 0),
        BackgroundColor3 = Color3.fromRGB(50, 180, 80),
        BorderSizePixel = 0,
        ZIndex = 502,
    })
    Create("UICorner", {CornerRadius = UDim.new(0, 6), Parent = UI.LoadingBar})

    return UI
end

-- ============================================
-- ANIMATIONS & EFFECTS
-- ============================================
function UI.SetupAnimations()
    -- Background gradient animation (rotates slowly)
    local gradientRotation = 45
    task.spawn(function()
        while UI.ScreenGui and UI.ScreenGui.Parent do
            gradientRotation = gradientRotation + CONFIG.GradientSpeed * 360 * task.wait(0.05)
            local bgGradient = UI.ScreenGui.BackgroundFrame:FindFirstChildOfClass("UIGradient")
            if bgGradient then
                bgGradient.Rotation = gradientRotation
            end
        end
    end)

    -- Floating particles animation
    task.spawn(function()
        while UI.ScreenGui and UI.ScreenGui.Parent do
            for _, p in ipairs(UI.Particles) do
                local currentPos = p.Frame.Position
                local newX = currentPos.X.Scale + p.Speed * p.Direction
                local newY = currentPos.Y.Scale - p.Speed * 0.3

                -- Wrap around
                if newX > 1 then newX = -0.05 end
                if newX < -0.05 then newX = 1 end
                if newY < -0.05 then newY = 1 end

                p.Frame.Position = UDim2.new(newX, 0, newY, 0)
            end
            task.wait(0.05)
        end
    end)

    -- Logo bobbing animation
    task.spawn(function()
        local startTime = tick()
        while UI.ScreenGui and UI.ScreenGui.Parent do
            local elapsed = tick() - startTime
            local offset = math.sin(elapsed * CONFIG.LogoBobSpeed) * CONFIG.LogoBobAmount
            UI.GameLogo.Position = UDim2.new(0.5, 0, 0, offset)

            -- Pulsing glow
            local pulse = 0.3 + math.sin(elapsed * 1.5) * 0.2
            UI.LogoStroke.Transparency = pulse

            task.wait(0.05)
        end
    end)

    -- Play button pulse animation
    task.spawn(function()
        local startTime = tick()
        while UI.ScreenGui and UI.ScreenGui.Parent do
            local elapsed = tick() - startTime
            local pulse = 1 + math.sin(elapsed * 2) * 0.02
            if not State.PlayButtonHovered then
                UI.PlayButton.Size = UDim2.new(0, 280 * pulse, 0, 55 * pulse)
            end
            task.wait(0.05)
        end
    end)

    -- Button hover effects
    local buttons = {
        {Btn = UI.PlayButton, OriginalSize = UDim2.new(0, 280, 0, 55)},
        {Btn = UI.StoreButton, OriginalSize = UDim2.new(0, 260, 0, 44)},
        {Btn = UI.SettingsButton, OriginalSize = UDim2.new(0, 260, 0, 44)},
        {Btn = UI.LeaderboardsButton, OriginalSize = UDim2.new(0, 260, 0, 44)},
        {Btn = UI.CodesButton, OriginalSize = UDim2.new(0, 260, 0, 44)},
    }

    for _, btnData in ipairs(buttons) do
        btnData.Btn.MouseEnter:Connect(function()
            Tween(btnData.Btn, {Size = UDim2.new(
                0, btnData.OriginalSize.X.Offset * CONFIG.ButtonHoverScale,
                0, btnData.OriginalSize.Y.Offset * CONFIG.ButtonHoverScale
            )}, 0.15)
            if btnData.Btn == UI.PlayButton then
                State.PlayButtonHovered = true
                Tween(UI.PlayStroke, {Transparency = 0}, 0.15)
            end
        end)

        btnData.Btn.MouseLeave:Connect(function()
            Tween(btnData.Btn, {Size = btnData.OriginalSize}, 0.15)
            if btnData.Btn == UI.PlayButton then
                State.PlayButtonHovered = false
                Tween(UI.PlayStroke, {Transparency = 0.3}, 0.15)
            end
        end)
    end

    -- Social button hover
    for name, btn in pairs(UI.SocialButtons) do
        btn.MouseEnter:Connect(function()
            Tween(btn, {Size = UDim2.new(0, 46, 0, 46)}, 0.15)
        end)
        btn.MouseLeave:Connect(function()
            Tween(btn, {Size = UDim2.new(0, 40, 0, 40)}, 0.15)
        end)
    end
end

-- ============================================
-- INTERACTION LOGIC
-- ============================================
local State = {
    PlayButtonHovered = false,
    MenuVisible = true,
    SettingsOpen = false,
    CodesOpen = false,
    MusicEnabled = true,
    SFXEnabled = true,
}

local Logic = {}

function Logic.SetupInteractions()
    -- Play Button - Start Game
    UI.PlayButton.MouseButton1Click:Connect(function()
        Logic.StartGame()
    end)

    -- Store Button - Open Store
    UI.StoreButton.MouseButton1Click:Connect(function()
        Logic.OpenStore()
    end)

    -- Settings Button - Toggle Settings Panel
    UI.SettingsButton.MouseButton1Click:Connect(function()
        Logic.ToggleSettings()
    end)

    -- Settings Close Button
    UI.SettingsPanel.Header.CloseButton.MouseButton1Click:Connect(function()
        Logic.HideSettings()
    end)

    -- Leaderboards Button
    UI.LeaderboardsButton.MouseButton1Click:Connect(function()
        Logic.OpenLeaderboards()
    end)

    -- Codes Button - Toggle Codes Panel
    UI.CodesButton.MouseButton1Click:Connect(function()
        Logic.ToggleCodes()
    end)

    -- Codes Close Button
    UI.CodesPanel.CloseButton.MouseButton1Click:Connect(function()
        Logic.HideCodes()
    end)

    -- Redeem Button
    UI.RedeemButton.MouseButton1Click:Connect(function()
        Logic.RedeemCode(UI.CodeInput.Text)
    end)

    -- Music Toggle
    UI.MusicToggle.MouseButton1Click:Connect(function()
        State.MusicEnabled = not State.MusicEnabled
        UI.MusicToggle.BackgroundColor3 = State.MusicEnabled
            and Color3.fromRGB(50, 180, 80) or Color3.fromRGB(100, 100, 120)
        UI.MusicToggle.Text = State.MusicEnabled and "ON" or "OFF"
        -- Apply to SoundService
        -- SoundService.[music].Playing = State.MusicEnabled
    end)

    -- SFX Toggle
    UI.SFXToggle.MouseButton1Click:Connect(function()
        State.SFXEnabled = not State.SFXEnabled
        UI.SFXToggle.BackgroundColor3 = State.SFXEnabled
            and Color3.fromRGB(50, 180, 80) or Color3.fromRGB(100, 100, 120)
        UI.SFXToggle.Text = State.SFXEnabled and "ON" or "OFF"
    end)

    -- Social Buttons
    UI.SocialButtons.Discord.MouseButton1Click:Connect(function()
        -- Copy invite to clipboard
        -- setclipboard(CONFIG.SocialIds.Discord)
        print("Discord invite copied!")
    end)
    UI.SocialButtons.Twitter.MouseButton1Click:Connect(function()
        -- setclipboard(CONFIG.SocialIds.Twitter)
        print("Twitter link copied!")
    end)
    UI.SocialButtons.YouTube.MouseButton1Click:Connect(function()
        -- setclipboard(CONFIG.SocialIds.YouTube)
        print("YouTube link copied!")
    end)
    UI.SocialButtons.RobloxGroup.MouseButton1Click:Connect(function()
        -- setclipboard(CONFIG.SocialIds.RobloxGroup)
        print("Roblox Group link copied!")
    end)
end

function Logic.StartGame()
    -- Animate loading overlay
    UI.LoadingOverlay.Visible = true
    UI.LoadingBar.Size = UDim2.new(0, 0, 1, 0)

    -- Simulate loading steps
    local steps = {0.1, 0.25, 0.45, 0.7, 0.85, 1.0}
    for _, progress in ipairs(steps) do
        Tween(UI.LoadingBar, {Size = UDim2.new(progress, 0, 1, 0)}, 0.3)
        task.wait(0.4)
    end

    task.wait(0.3)

    -- Hide main menu and loading
    UI.ScreenGui.Enabled = false
    UI.LoadingOverlay.Visible = false

    -- Fire remote to spawn player
    local spawnRemote = ReplicatedStorage:FindFirstChild("SpawnPlayer")
    if spawnRemote then
        spawnRemote:FireServer()
    end

    -- Alternatively, teleport to game place
    -- TeleportService:Teleport(gamePlaceId, player)

    print("Game started!")
end

function Logic.OpenStore()
    -- Open the Store GUI (from Shop UI template)
    print("Opening store...")
    -- Fire event to show Store UI
    local showStore = ReplicatedStorage:FindFirstChild("ShowStore")
    if showStore then
        showStore:Fire()
    end
end

function Logic.ToggleSettings()
    if State.SettingsOpen then
        Logic.HideSettings()
    else
        Logic.ShowSettings()
    end
end

function Logic.ShowSettings()
    State.SettingsOpen = true
    UI.SettingsPanel.Visible = true
    UI.SettingsPanel.Size = UDim2.new(0, 350, 0, 400)
    TweenBounce(UI.SettingsPanel, {Size = UDim2.new(0, 400, 0, 450)}, 0.3)
end

function Logic.HideSettings()
    State.SettingsOpen = false
    Tween(UI.SettingsPanel, {Size = UDim2.new(0, 350, 0, 400)}, 0.2)
    task.delay(0.2, function()
        UI.SettingsPanel.Visible = false
    end)
end

function Logic.OpenLeaderboards()
    print("Opening leaderboards...")
    -- Trigger leaderboards UI
end

function Logic.ToggleCodes()
    if State.CodesOpen then
        Logic.HideCodes()
    else
        Logic.ShowCodes()
    end
end

function Logic.ShowCodes()
    State.CodesOpen = true
    UI.CodesPanel.Visible = true
    UI.CodesPanel.Size = UDim2.new(0, 340, 0, 220)
    TweenBounce(UI.CodesPanel, {Size = UDim2.new(0, 380, 0, 250)}, 0.3)
end

function Logic.HideCodes()
    State.CodesOpen = false
    Tween(UI.CodesPanel, {Size = UDim2.new(0, 340, 0, 220)}, 0.2)
    task.delay(0.2, function()
        UI.CodesPanel.Visible = false
    end)
end

function Logic.RedeemCode(code)
    if code == "" or code == "Enter code here..." then
        return
    end

    UI.RedeemButton.Text = "Checking..."
    UI.RedeemButton.BackgroundColor3 = Color3.fromRGB(100, 100, 120)

    -- Fire remote to validate code
    local validateCode = ReplicatedStorage:FindFirstChild("ValidateCode")
    if validateCode then
        local result = validateCode:InvokeServer(code)
        if result.Success then
            UI.RedeemButton.Text = "Success!"
            UI.RedeemButton.BackgroundColor3 = Color3.fromRGB(50, 180, 80)
            UI.CodeInput.Text = ""
            task.delay(1.5, function()
                UI.RedeemButton.Text = "REDEEM"
                UI.RedeemButton.BackgroundColor3 = Color3.fromRGB(50, 180, 80)
            end)
        else
            UI.RedeemButton.Text = result.Message or "Invalid Code"
            UI.RedeemButton.BackgroundColor3 = Color3.fromRGB(180, 50, 50)
            task.delay(2, function()
                UI.RedeemButton.Text = "REDEEM"
                UI.RedeemButton.BackgroundColor3 = Color3.fromRGB(50, 180, 80)
            end)
        end
    else
        UI.RedeemButton.Text = "Server Error"
        task.delay(2, function()
            UI.RedeemButton.Text = "REDEEM"
            UI.RedeemButton.BackgroundColor3 = Color3.fromRGB(50, 180, 80)
        end)
    end
end

-- ============================================
-- RESPONSIVE LAYOUT
-- ============================================
function Logic.SetupResponsive()
    local function UpdateLayout()
        local viewportSize = workspace.CurrentCamera.ViewportSize
        local isMobile = viewportSize.X < 600
        local isTablet = viewportSize.X >= 600 and viewportSize.X < 1024

        if isMobile then
            -- Mobile layout
            UI.ContentFrame.Size = UDim2.new(0.9, 0, 0.85, 0)
            UI.ContentFrame.Position = UDim2.new(0.5, 0, 0.5, 0)
            UI.GameLogo.Size = UDim2.new(0, 120, 0, 120)
            UI.GameTitle.TextSize = 28
            UI.GameTitle.Position = UDim2.new(0.5, 0, 0, 130)
            UI.Subtitle.TextSize = 14
            UI.Subtitle.Position = UDim2.new(0.5, 0, 0, 168)
            UI.PlayButton.Size = UDim2.new(0, 240, 0, 50)
            UI.StoreButton.Size = UDim2.new(0, 220, 0, 40)
            UI.SettingsButton.Size = UDim2.new(0, 220, 0, 40)
        elseif isTablet then
            -- Tablet layout
            UI.ContentFrame.Size = UDim2.new(0, 420, 0, 500)
            UI.ContentFrame.Position = UDim2.new(0.5, 0, 0.48, 0)
            UI.GameLogo.Size = UDim2.new(0, 150, 0, 150)
            UI.GameTitle.TextSize = 36
            UI.GameTitle.Position = UDim2.new(0.5, 0, 0, 160)
            UI.Subtitle.TextSize = 16
            UI.Subtitle.Position = UDim2.new(0.5, 0, 0, 208)
        else
            -- Desktop layout (default)
            UI.ContentFrame.Size = UDim2.new(0, 450, 0, 520)
            UI.ContentFrame.Position = UDim2.new(0.5, 0, 0.48, 0)
            UI.GameLogo.Size = UDim2.new(0, 180, 0, 180)
            UI.GameTitle.TextSize = 42
            UI.GameTitle.Position = UDim2.new(0.5, 0, 0, 190)
            UI.Subtitle.TextSize = 18
            UI.Subtitle.Position = UDim2.new(0.5, 0, 0, 242)
        end
    end

    workspace.CurrentCamera:GetPropertyChangedSignal("ViewportSize"):Connect(UpdateLayout)
    UpdateLayout()
end

-- ============================================
-- INITIALIZATION
-- ============================================
UI.Build()
UI.SetupAnimations()
UI.SetupInteractions()
Logic.SetupResponsive()

-- Keep player character from spawning until Play is clicked
local function onCharacterAdded(character)
    -- Wait for humanoid and anchor
    local humanoidRootPart = character:WaitForChild("HumanoidRootPart")
    humanoidRootPart.Anchored = true
    local humanoid = character:WaitForChild("Humanoid")
    humanoid.WalkSpeed = 0
    humanoid.JumpPower = 0
end

if player.Character then
    onCharacterAdded(player.Character)
end
player.CharacterAdded:Connect(onCharacterAdded)

print("Main Menu initialized successfully!")
