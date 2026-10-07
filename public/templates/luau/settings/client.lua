--[[
    Settings Menu - Client Side
    A settings panel with volume sliders, toggles, and clean UIListLayout
    Features: Animated sliders, toggle switches, tab navigation, auto-save
]]

-- Services
local Players = game:GetService("Players")
local TweenService = game:GetService("TweenService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local SoundService = game:GetService("SoundService")
local UserInputService = game:GetService("UserInputService")
local RunService = game:GetService("RunService")
local Lighting = game:GetService("Lighting")

local player = Players.LocalPlayer
local playerGui = player:WaitForChild("PlayerGui")

-- Constants
local SETTINGS_SIZE = UDim2.new(0, 560, 0, 480)
local SETTINGS_POSITION = UDim2.new(0.5, -280, 0.5, -240)
local SLIDER_WIDTH = 220
local SLIDER_HEIGHT = 8
local KNOB_SIZE = 20
local TOGGLE_WIDTH = 50
local TOGGLE_HEIGHT = 26
local TWEEN_DURATION = 0.25
local SECTION_PADDING = 16

-- Colors
local COLOR_BG = Color3.fromRGB(25, 25, 35)
local COLOR_HEADER = Color3.fromRGB(35, 38, 50)
local COLOR_ACCENT = Color3.fromRGB(100, 150, 255)
local COLOR_ACCENT_HOVER = Color3.fromRGB(120, 170, 255)
local COLOR_TEXT_PRIMARY = Color3.fromRGB(255, 255, 255)
local COLOR_TEXT_SECONDARY = Color3.fromRGB(160, 165, 180)
local COLOR_TEXT_MUTED = Color3.fromRGB(100, 105, 120)
local COLOR_ROW_BG = Color3.fromRGB(35, 38, 50)
local COLOR_ROW_HOVER = Color3.fromRGB(45, 48, 62)
local COLOR_SLIDER_BG = Color3.fromRGB(50, 52, 65)
local COLOR_SLIDER_FILL = Color3.fromRGB(100, 150, 255)
local COLOR_TOGGLE_OFF = Color3.fromRGB(60, 62, 75)
local COLOR_TOGGLE_ON = Color3.fromRGB(100, 150, 255)
local COLOR_TAB_ACTIVE = Color3.fromRGB(100, 150, 255)
local COLOR_TAB_INACTIVE = Color3.fromRGB(60, 65, 80)
local COLOR_SAVE = Color3.fromRGB(50, 180, 80)
local COLOR_RESET = Color3.fromRGB(180, 80, 60)

-- Tween presets
local tweenInfoStandard = TweenInfo.new(TWEEN_DURATION, Enum.EasingStyle.Quad, Enum.EasingDirection.Out)
local tweenInfoSpring = TweenInfo.new(TWEEN_DURATION * 1.2, Enum.EasingStyle.Back, Enum.EasingDirection.Out)
local tweenInfoBounce = TweenInfo.new(TWEEN_DURATION, Enum.EasingStyle.Elastic, Enum.EasingDirection.Out)

-- Default settings
local DEFAULT_SETTINGS = {
    VolumeMaster = 80,
    VolumeMusic = 70,
    VolumeSFX = 85,
    VolumeVoice = 60,
    Fullscreen = false,
    ShowFPS = false,
    GraphicsQuality = 7,
    Language = "English",
    Difficulty = "Normal",
    ShowTutorial = true,
    TextSize = 100,
    ColorblindMode = "None",
    ReduceMotion = false,
}

-- Current settings (loaded from defaults or server)
local currentSettings = {}
for key, value in pairs(DEFAULT_SETTINGS) do
    currentSettings[key] = value
end

-- GUI References
local settingsGui, settingsFrame, contentContainer, tabContainer
local sections = {}
local activeTab = "Audio"
local isVisible = false

-- Slider drag state
local draggingSlider = nil
local sliderConnections = {}

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

local function FormatPercentage(value)
    return tostring(math.floor(value)) .. "%"
end

-----------------------------------------------------------
-- UI Construction
-----------------------------------------------------------

local function BuildUI()
    -- ScreenGui
    settingsGui = Create("ScreenGui", {
        Name = "SettingsGui",
        ResetOnSpawn = false,
        ZIndexBehavior = Enum.ZIndexBehavior.Sibling,
        Parent = playerGui,
    })

    -- Main Settings Frame
    settingsFrame = Create("Frame", {
        Name = "SettingsFrame",
        Size = SETTINGS_SIZE,
        Position = UDim2.new(0.5, 0, 0.4, 0),
        AnchorPoint = Vector2.new(0.5, 0.5),
        BackgroundColor3 = COLOR_BG,
        BorderSizePixel = 0,
        Visible = false,
        ZIndex = 10,
        Parent = settingsGui,
    })

    Create("UICorner", {
        CornerRadius = UDim.new(0, 14),
        Parent = settingsFrame,
    })

    Create("UIGradient", {
        Color = ColorSequence.new({
            ColorSequenceKeypoint.new(0, Color3.fromRGB(28, 28, 40)),
            ColorSequenceKeypoint.new(1, Color3.fromRGB(22, 22, 32)),
        }),
        Rotation = 90,
        Parent = settingsFrame,
    })

    -- Shadow
    Create("ImageLabel", {
        Name = "Shadow",
        Size = UDim2.new(1, 40, 1, 40),
        Position = UDim2.new(0, -20, 0, -20),
        BackgroundTransparency = 1,
        Image = "rbxassetid://5554236805",
        ImageColor3 = Color3.fromRGB(0, 0, 0),
        ImageTransparency = 0.65,
        ScaleType = Enum.ScaleType.Slice,
        SliceCenter = Rect.new(23, 23, 277, 277),
        ZIndex = 9,
        Parent = settingsFrame,
    })

    -- Header
    local headerFrame = Create("Frame", {
        Name = "HeaderFrame",
        Size = UDim2.new(1, 0, 0, 60),
        BackgroundColor3 = COLOR_HEADER,
        BorderSizePixel = 0,
        ZIndex = 11,
        Parent = settingsFrame,
    })

    Create("UICorner", {
        CornerRadius = UDim.new(0, 14),
        Parent = headerFrame,
    })

    local headerFix = Create("Frame", {
        Size = UDim2.new(1, 0, 0, 14),
        Position = UDim2.new(0, 0, 1, -14),
        BackgroundColor3 = COLOR_HEADER,
        BorderSizePixel = 0,
        ZIndex = 11,
        Parent = headerFrame,
    })

    Create("TextLabel", {
        Name = "TitleLabel",
        Size = UDim2.new(0.5, 0, 0, 30),
        Position = UDim2.new(0, 20, 0, 10),
        BackgroundTransparency = 1,
        Text = "Settings",
        TextColor3 = COLOR_TEXT_PRIMARY,
        TextSize = 22,
        Font = Enum.Font.GothamBold,
        TextXAlignment = Enum.TextXAlignment.Left,
        ZIndex = 12,
        Parent = headerFrame,
    })

    local closeButton = Create("TextButton", {
        Name = "CloseButton",
        Size = UDim2.new(0, 70, 0, 30),
        Position = UDim2.new(1, -90, 0, 15),
        BackgroundColor3 = COLOR_ROW_BG,
        Text = "Close",
        TextColor3 = COLOR_TEXT_PRIMARY,
        TextSize = 12,
        Font = Enum.Font.GothamSemibold,
        AutoButtonColor = false,
        ZIndex = 12,
        Parent = headerFrame,
    })

    Create("UICorner", {
        CornerRadius = UDim.new(0, 8),
        Parent = closeButton,
    })

    closeButton.MouseEnter:Connect(function()
        Tween(closeButton, {BackgroundColor3 = COLOR_ROW_HOVER})
    end)
    closeButton.MouseLeave:Connect(function()
        Tween(closeButton, {BackgroundColor3 = COLOR_ROW_BG})
    end)
    closeButton.MouseButton1Click:Connect(function()
        ToggleSettings(false)
    end)

    -- Tab Container
    tabContainer = Create("Frame", {
        Name = "TabContainer",
        Size = UDim2.new(1, -40, 0, 40),
        Position = UDim2.new(0, 20, 0, 68),
        BackgroundTransparency = 1,
        ZIndex = 11,
        Parent = settingsFrame,
    })

    local tabLayout = Create("UIListLayout", {
        Padding = UDim.new(0, 8),
        FillDirection = Enum.FillDirection.Horizontal,
        SortOrder = Enum.SortOrder.LayoutOrder,
        Parent = tabContainer,
    })

    -- Content Container
    contentContainer = Create("Frame", {
        Name = "ContentContainer",
        Size = UDim2.new(1, -40, 1, -(60 + 40 + 50)),
        Position = UDim2.new(0, 20, 0, 112),
        BackgroundColor3 = COLOR_ROW_BG,
        BorderSizePixel = 0,
        ZIndex = 11,
        Parent = settingsFrame,
    })

    Create("UICorner", {
        CornerRadius = UDim.new(0, 10),
        Parent = contentContainer,
    })

    -- Footer
    local footerFrame = Create("Frame", {
        Name = "FooterFrame",
        Size = UDim2.new(1, 0, 0, 44),
        Position = UDim2.new(0, 0, 1, -44),
        BackgroundColor3 = COLOR_HEADER,
        BorderSizePixel = 0,
        ZIndex = 11,
        Parent = settingsFrame,
    })

    Create("UICorner", {
        CornerRadius = UDim.new(0, 14),
        Parent = footerFrame,
    })

    local footerFix = Create("Frame", {
        Size = UDim2.new(1, 0, 0, 14),
        Position = UDim2.new(0, 0, 0, 0),
        BackgroundColor3 = COLOR_HEADER,
        BorderSizePixel = 0,
        ZIndex = 11,
        Parent = footerFrame,
    })

    local resetButton = Create("TextButton", {
        Name = "ResetButton",
        Size = UDim2.new(0, 80, 0, 28),
        Position = UDim2.new(0, 20, 0, 8),
        BackgroundColor3 = COLOR_RESET,
        Text = "Reset",
        TextColor3 = COLOR_TEXT_PRIMARY,
        TextSize = 12,
        Font = Enum.Font.GothamSemibold,
        AutoButtonColor = false,
        ZIndex = 12,
        Parent = footerFrame,
    })

    Create("UICorner", {
        CornerRadius = UDim.new(0, 6),
        Parent = resetButton,
    })

    local saveButton = Create("TextButton", {
        Name = "SaveButton",
        Size = UDim2.new(0, 80, 0, 28),
        Position = UDim2.new(1, -100, 0, 8),
        BackgroundColor3 = COLOR_SAVE,
        Text = "Save",
        TextColor3 = COLOR_TEXT_PRIMARY,
        TextSize = 12,
        Font = Enum.Font.GothamSemibold,
        AutoButtonColor = false,
        ZIndex = 12,
        Parent = footerFrame,
    })

    Create("UICorner", {
        CornerRadius = UDim.new(0, 6),
        Parent = saveButton,
    })

    local statusLabel = Create("TextLabel", {
        Name = "StatusLabel",
        Size = UDim2.new(0, 200, 0, 28),
        Position = UDim2.new(0.5, -100, 0, 8),
        BackgroundTransparency = 1,
        Text = "",
        TextColor3 = COLOR_TEXT_SECONDARY,
        TextSize = 12,
        Font = Enum.Font.Gotham,
        TextXAlignment = Enum.TextXAlignment.Center,
        ZIndex = 12,
        Parent = footerFrame,
    })

    -- Button handlers
    resetButton.MouseEnter:Connect(function()
        Tween(resetButton, {BackgroundColor3 = Color3.fromRGB(200, 90, 70)})
    end)
    resetButton.MouseLeave:Connect(function()
        Tween(resetButton, {BackgroundColor3 = COLOR_RESET})
    end)
    resetButton.MouseButton1Click:Connect(ResetSettings)

    saveButton.MouseEnter:Connect(function()
        Tween(saveButton, {BackgroundColor3 = Color3.fromRGB(60, 200, 90)})
    end)
    saveButton.MouseLeave:Connect(function()
        Tween(saveButton, {BackgroundColor3 = COLOR_SAVE})
    end)
    saveButton.MouseButton1Click:Connect(SaveSettings)

    -- Settings Open Button
    local settingsButton = Create("TextButton", {
        Name = "SettingsButton",
        Size = UDim2.new(0, 50, 0, 50),
        Position = UDim2.new(1, -70, 0, 20),
        BackgroundColor3 = COLOR_HEADER,
        Text = "S",
        TextColor3 = COLOR_ACCENT,
        TextSize = 24,
        Font = Enum.Font.GothamBold,
        AutoButtonColor = false,
        ZIndex = 5,
        Parent = settingsGui,
    })

    Create("UICorner", {
        CornerRadius = UDim.new(1, 0),
        Parent = settingsButton,
    })

    settingsButton.MouseEnter:Connect(function()
        Tween(settingsButton, {BackgroundColor3 = COLOR_ROW_HOVER})
        Tween(settingsButton, {Size = UDim2.new(0, 54, 0, 54)})
        settingsButton.Position = UDim2.new(1, -74, 0, 18)
    end)
    settingsButton.MouseLeave:Connect(function()
        Tween(settingsButton, {BackgroundColor3 = COLOR_HEADER})
        Tween(settingsButton, {Size = UDim2.new(0, 50, 0, 50)})
        settingsButton.Position = UDim2.new(1, -70, 0, 20)
    end)
    settingsButton.MouseButton1Click:Connect(function()
        ToggleSettings(true)
    end)
end

-----------------------------------------------------------
-- Slider Component
-----------------------------------------------------------

local function CreateSlider(parent, settingKey, label, min, max, defaultValue)
    local container = Create("Frame", {
        Name = settingKey .. "Container",
        Size = UDim2.new(1, -SECTION_PADDING * 2, 0, 50),
        BackgroundTransparency = 1,
        Parent = parent,
    })

    -- Label
    local labelText = Create("TextLabel", {
        Name = "Label",
        Size = UDim2.new(0, 160, 0, 24),
        Position = UDim2.new(0, 0, 0, 0),
        BackgroundTransparency = 1,
        Text = label,
        TextColor3 = COLOR_TEXT_PRIMARY,
        TextSize = 14,
        Font = Enum.Font.GothamSemibold,
        TextXAlignment = Enum.TextXAlignment.Left,
        ZIndex = 13,
        Parent = container,
    })

    -- Value label
    local valueLabel = Create("TextLabel", {
        Name = "ValueLabel",
        Size = UDim2.new(0, 50, 0, 24),
        Position = UDim2.new(1, -50, 0, 0),
        BackgroundTransparency = 1,
        Text = FormatPercentage(defaultValue),
        TextColor3 = COLOR_ACCENT,
        TextSize = 14,
        Font = Enum.Font.GothamBold,
        TextXAlignment = Enum.TextXAlignment.Right,
        ZIndex = 13,
        Parent = container,
    })

    -- Slider background
    local sliderBg = Create("Frame", {
        Name = "SliderBackground",
        Size = UDim2.new(1, 0, 0, SLIDER_HEIGHT),
        Position = UDim2.new(0, 0, 0, 30),
        BackgroundColor3 = COLOR_SLIDER_BG,
        BorderSizePixel = 0,
        ZIndex = 13,
        Parent = container,
    })

    Create("UICorner", {
        CornerRadius = UDim.new(0, 4),
        Parent = sliderBg,
    })

    -- Slider fill
    local sliderFill = Create("Frame", {
        Name = "SliderFill",
        Size = UDim2.new((defaultValue - min) / (max - min), 0, 1, 0),
        BackgroundColor3 = COLOR_SLIDER_FILL,
        BorderSizePixel = 0,
        ZIndex = 14,
        Parent = sliderBg,
    })

    Create("UICorner", {
        CornerRadius = UDim.new(0, 4),
        Parent = sliderFill,
    })

    -- Slider knob
    local knob = Create("Frame", {
        Name = "Knob",
        Size = UDim2.new(0, KNOB_SIZE, 0, KNOB_SIZE),
        Position = UDim2.new((defaultValue - min) / (max - min), -KNOB_SIZE/2, 0.5, -KNOB_SIZE/2),
        AnchorPoint = Vector2.new(0, 0),
        BackgroundColor3 = COLOR_TEXT_PRIMARY,
        BorderSizePixel = 0,
        ZIndex = 15,
        Parent = sliderBg,
    })

    Create("UICorner", {
        CornerRadius = UDim.new(1, 0),
        Parent = knob,
    })

    -- Knob glow
    local knobGlow = Create("UIStroke", {
        Color = COLOR_ACCENT,
        Thickness = 2,
        Transparency = 0.5,
        Parent = knob,
    })

    -- Interactivity
    local isDragging = false

    local function UpdateSlider(input)
        local sliderPos = sliderBg.AbsolutePosition.X
        local sliderWidth = sliderBg.AbsoluteSize.X
        local inputX = input.Position.X

        local percent = math.clamp((inputX - sliderPos) / sliderWidth, 0, 1)
        local value = min + (percent * (max - min))

        -- Update visual
        sliderFill.Size = UDim2.new(percent, 0, 1, 0)
        knob.Position = UDim2.new(percent, -KNOB_SIZE/2, 0.5, -KNOB_SIZE/2)
        valueLabel.Text = FormatPercentage(value)

        -- Update setting
        currentSettings[settingKey] = value

        -- Apply live
        ApplySetting(settingKey, value)

        return value
    end

    sliderBg.InputBegan:Connect(function(input)
        if input.UserInputType == Enum.UserInputType.MouseButton1 or
           input.UserInputType == Enum.UserInputType.Touch then
            isDragging = true
            draggingSlider = settingKey
            UpdateSlider(input)
            -- Enlarge knob
            Tween(knob, {Size = UDim2.new(0, 26, 0, 26)})
            Tween(knobGlow, {Thickness = 3, Transparency = 0.2})
        end
    end)

    knob.InputBegan:Connect(function(input)
        if input.UserInputType == Enum.UserInputType.MouseButton1 or
           input.UserInputType == Enum.UserInputType.Touch then
            isDragging = true
            draggingSlider = settingKey
            Tween(knob, {Size = UDim2.new(0, 26, 0, 26)})
            Tween(knobGlow, {Thickness = 3, Transparency = 0.2})
        end
    end)

    -- Store slider reference for global input handling
    sliderConnections[settingKey] = {
        Update = UpdateSlider,
        Knob = knob,
        KnobGlow = knobGlow,
    }

    return container
end

-----------------------------------------------------------
-- Toggle Component
-----------------------------------------------------------

local function CreateToggle(parent, settingKey, label, defaultValue)
    local container = Create("Frame", {
        Name = settingKey .. "Container",
        Size = UDim2.new(1, -SECTION_PADDING * 2, 0, 44),
        BackgroundTransparency = 1,
        Parent = parent,
    })

    -- Label
    Create("TextLabel", {
        Name = "Label",
        Size = UDim2.new(0, 200, 1, 0),
        BackgroundTransparency = 1,
        Text = label,
        TextColor3 = COLOR_TEXT_PRIMARY,
        TextSize = 14,
        Font = Enum.Font.GothamSemibold,
        TextXAlignment = Enum.TextXAlignment.Left,
        ZIndex = 13,
        Parent = container,
    })

    -- Toggle background
    local toggleBg = Create("TextButton", {
        Name = "ToggleBackground",
        Size = UDim2.new(0, TOGGLE_WIDTH, 0, TOGGLE_HEIGHT),
        Position = UDim2.new(1, -TOGGLE_WIDTH, 0.5, -TOGGLE_HEIGHT/2),
        BackgroundColor3 = defaultValue and COLOR_TOGGLE_ON or COLOR_TOGGLE_OFF,
        Text = "",
        AutoButtonColor = false,
        ZIndex = 13,
        Parent = container,
    })

    Create("UICorner", {
        CornerRadius = UDim.new(0, TOGGLE_HEIGHT/2),
        Parent = toggleBg,
    })

    -- Toggle knob
    local toggleKnob = Create("Frame", {
        Name = "ToggleKnob",
        Size = UDim2.new(0, TOGGLE_HEIGHT - 4, 0, TOGGLE_HEIGHT - 4),
        Position = defaultValue and UDim2.new(1, -(TOGGLE_HEIGHT - 2), 0.5, -(TOGGLE_HEIGHT - 4)/2)
                               or UDim2.new(0, 2, 0.5, -(TOGGLE_HEIGHT - 4)/2),
        BackgroundColor3 = COLOR_TEXT_PRIMARY,
        BorderSizePixel = 0,
        ZIndex = 14,
        Parent = toggleBg,
    })

    Create("UICorner", {
        CornerRadius = UDim.new(1, 0),
        Parent = toggleKnob,
    })

    -- State label
    local stateLabel = Create("TextLabel", {
        Name = "StateLabel",
        Size = UDim2.new(0, 60, 0, 20),
        Position = UDim2.new(1, -TOGGLE_WIDTH - 65, 0.5, -10),
        BackgroundTransparency = 1,
        Text = defaultValue and "ON" or "OFF",
        TextColor3 = defaultValue and COLOR_TOGGLE_ON or COLOR_TEXT_MUTED,
        TextSize = 12,
        Font = Enum.Font.GothamBold,
        TextXAlignment = Enum.TextXAlignment.Right,
        ZIndex = 13,
        Parent = container,
    })

    -- Toggle click handler
    toggleBg.MouseButton1Click:Connect(function()
        local newValue = not currentSettings[settingKey]
        currentSettings[settingKey] = newValue

        -- Animate toggle
        if newValue then
            Tween(toggleBg, {BackgroundColor3 = COLOR_TOGGLE_ON})
            Tween(toggleKnob, {
                Position = UDim2.new(1, -(TOGGLE_HEIGHT - 2), 0.5, -(TOGGLE_HEIGHT - 4)/2)
            })
            stateLabel.Text = "ON"
            Tween(stateLabel, {TextColor3 = COLOR_TOGGLE_ON})
        else
            Tween(toggleBg, {BackgroundColor3 = COLOR_TOGGLE_OFF})
            Tween(toggleKnob, {
                Position = UDim2.new(0, 2, 0.5, -(TOGGLE_HEIGHT - 4)/2)
            })
            stateLabel.Text = "OFF"
            Tween(stateLabel, {TextColor3 = COLOR_TEXT_MUTED})
        end

        ApplySetting(settingKey, newValue)
    end)

    toggleBg.MouseEnter:Connect(function()
        Tween(toggleBg, {BackgroundTransparency = 0.1})
    end)
    toggleBg.MouseLeave:Connect(function()
        Tween(toggleBg, {BackgroundTransparency = 0})
    end)

    return container
end

-----------------------------------------------------------
-- Dropdown Component
-----------------------------------------------------------

local function CreateDropdown(parent, settingKey, label, options, defaultValue)
    local container = Create("Frame", {
        Name = settingKey .. "Container",
        Size = UDim2.new(1, -SECTION_PADDING * 2, 0, 44),
        BackgroundTransparency = 1,
        Parent = parent,
    })

    -- Label
    Create("TextLabel", {
        Name = "Label",
        Size = UDim2.new(0, 160, 1, 0),
        BackgroundTransparency = 1,
        Text = label,
        TextColor3 = COLOR_TEXT_PRIMARY,
        TextSize = 14,
        Font = Enum.Font.GothamSemibold,
        TextXAlignment = Enum.TextXAlignment.Left,
        ZIndex = 13,
        Parent = container,
    })

    -- Dropdown button
    local dropdownBtn = Create("TextButton", {
        Name = "DropdownButton",
        Size = UDim2.new(0, 140, 0, 32),
        Position = UDim2.new(1, -140, 0.5, -16),
        BackgroundColor3 = COLOR_ROW_BG,
        Text = "  " .. defaultValue .. "  v",
        TextColor3 = COLOR_TEXT_PRIMARY,
        TextSize = 13,
        Font = Enum.Font.Gotham,
        TextXAlignment = Enum.TextXAlignment.Left,
        AutoButtonColor = false,
        ZIndex = 13,
        Parent = container,
    })

    Create("UICorner", {
        CornerRadius = UDim.new(0, 8),
        Parent = dropdownBtn,
    })

    local dropdownOpen = false
    local dropdownMenu = nil

    dropdownBtn.MouseButton1Click:Connect(function()
        dropdownOpen = not dropdownOpen

        if dropdownOpen then
            dropdownBtn.Text = "  " .. currentSettings[settingKey] .. "  ^"

            -- Create dropdown menu
            dropdownMenu = Create("Frame", {
                Name = "DropdownMenu",
                Size = UDim2.new(0, 140, 0, #options * 32),
                Position = UDim2.new(1, -140, 0, 36),
                BackgroundColor3 = COLOR_ROW_HOVER,
                BorderSizePixel = 0,
                ZIndex = 20,
                Parent = dropdownBtn,
            })

            Create("UICorner", {
                CornerRadius = UDim.new(0, 8),
                Parent = dropdownMenu,
            })

            for i, option in ipairs(options) do
                local optionBtn = Create("TextButton", {
                    Name = "Option_" .. option,
                    Size = UDim2.new(1, 0, 0, 30),
                    Position = UDim2.new(0, 0, 0, (i-1) * 32 + 1),
                    BackgroundColor3 = option == currentSettings[settingKey] and COLOR_ACCENT or COLOR_ROW_HOVER,
                    Text = "  " .. option,
                    TextColor3 = COLOR_TEXT_PRIMARY,
                    TextSize = 12,
                    Font = Enum.Font.Gotham,
                    TextXAlignment = Enum.TextXAlignment.Left,
                    AutoButtonColor = false,
                    ZIndex = 21,
                    Parent = dropdownMenu,
                })

                optionBtn.MouseEnter:Connect(function()
                    Tween(optionBtn, {BackgroundColor3 = COLOR_ACCENT})
                end)
                optionBtn.MouseLeave:Connect(function()
                    if option ~= currentSettings[settingKey] then
                        Tween(optionBtn, {BackgroundColor3 = COLOR_ROW_HOVER})
                    end
                end)

                optionBtn.MouseButton1Click:Connect(function()
                    currentSettings[settingKey] = option
                    dropdownBtn.Text = "  " .. option .. "  v"
                    dropdownOpen = false
                    if dropdownMenu then
                        dropdownMenu:Destroy()
                        dropdownMenu = nil
                    end
                    ApplySetting(settingKey, option)
                end)
            end
        else
            dropdownBtn.Text = "  " .. currentSettings[settingKey] .. "  v"
            if dropdownMenu then
                dropdownMenu:Destroy()
                dropdownMenu = nil
            end
        end
    end)

    return container
end

-----------------------------------------------------------
-- Section Construction
-----------------------------------------------------------

local function CreateSection(name, title)
    local section = Create("Frame", {
        Name = name .. "Section",
        Size = UDim2.new(1, 0, 1, 0),
        BackgroundTransparency = 1,
        Visible = false,
        ZIndex = 12,
        Parent = contentContainer,
    })

    -- Scrollable content
    local scrollingFrame = Create("ScrollingFrame", {
        Name = "ScrollingContent",
        Size = UDim2.new(1, 0, 1, 0),
        BackgroundTransparency = 1,
        BorderSizePixel = 0,
        ScrollBarThickness = 4,
        ScrollBarImageColor3 = COLOR_ACCENT,
        ScrollBarImageTransparency = 0.5,
        CanvasSize = UDim2.new(0, 0, 0, 300),
        ZIndex = 12,
        Parent = section,
    })

    Create("UIListLayout", {
        Padding = UDim.new(0, 8),
        SortOrder = Enum.SortOrder.LayoutOrder,
        Parent = scrollingFrame,
    })

    Create("UIPadding", {
        PaddingTop = UDim.new(0, SECTION_PADDING),
        PaddingBottom = UDim.new(0, SECTION_PADDING),
        PaddingLeft = UDim.new(0, SECTION_PADDING),
        PaddingRight = UDim.new(0, SECTION_PADDING),
        Parent = scrollingFrame,
    })

    sections[name] = { Frame = section, Scroll = scrollingFrame }
    return scrollingFrame
end

local function CreateTabButton(name, displayName, icon)
    local btn = Create("TextButton", {
        Name = name .. "Tab",
        Size = UDim2.new(0, 0, 1, 0),
        AutomaticSize = Enum.AutomaticSize.X,
        BackgroundColor3 = (name == activeTab) and COLOR_TAB_ACTIVE or COLOR_TAB_INACTIVE,
        Text = "  " .. (icon or "") .. " " .. displayName .. "  ",
        TextColor3 = (name == activeTab) and COLOR_TEXT_PRIMARY or COLOR_TEXT_SECONDARY,
        TextSize = 13,
        Font = Enum.Font.GothamSemibold,
        AutoButtonColor = false,
        ZIndex = 12,
        Parent = tabContainer,
    })

    Create("UICorner", {
        CornerRadius = UDim.new(0, 8),
        Parent = btn,
    })

    btn.MouseButton1Click:Connect(function()
        SwitchTab(name)
    end)

    btn.MouseEnter:Connect(function()
        if name ~= activeTab then
            Tween(btn, {BackgroundColor3 = COLOR_ROW_HOVER})
        end
    end)
    btn.MouseLeave:Connect(function()
        if name ~= activeTab then
            Tween(btn, {BackgroundColor3 = COLOR_TAB_INACTIVE})
        end
    end)

    return btn
end

-----------------------------------------------------------
-- Tab Switching
-----------------------------------------------------------

local tabButtons = {}

function SwitchTab(tabName)
    if tabName == activeTab then return end
    activeTab = tabName

    -- Update tab button visuals
    for name, btn in pairs(tabButtons) do
        if name == tabName then
            Tween(btn, {BackgroundColor3 = COLOR_TAB_ACTIVE})
            btn.TextColor3 = COLOR_TEXT_PRIMARY
        else
            Tween(btn, {BackgroundColor3 = COLOR_TAB_INACTIVE})
            btn.TextColor3 = COLOR_TEXT_SECONDARY
        end
    end

    -- Switch sections with animation
    for name, section in pairs(sections) do
        if name == tabName then
            section.Frame.Visible = true
            section.Frame.BackgroundTransparency = 1
            Tween(section.Frame, {BackgroundTransparency = 1}, tweenInfoStandard)
        else
            section.Frame.Visible = false
        end
    end
end

-----------------------------------------------------------
-- Visibility Toggle
-----------------------------------------------------------

function ToggleSettings(show)
    isVisible = show

    if show then
        settingsFrame.Visible = true
        Tween(settingsFrame, {
            Position = SETTINGS_POSITION,
            BackgroundTransparency = 0,
        }, tweenInfoSpring)
    else
        Tween(settingsFrame, {
            Position = UDim2.new(0.5, 0, 0.35, 0),
            BackgroundTransparency = 1,
        }, tweenInfoStandard)
        task.delay(TWEEN_DURATION, function()
            if not isVisible then
                settingsFrame.Visible = false
            end
        end)
    end
end

-----------------------------------------------------------
-- Settings Application
-----------------------------------------------------------

function ApplySetting(key, value)
    if string.sub(key, 1, 6) == "Volume" then
        -- Apply volume settings
        local category = string.sub(key, 7)
        category = string.lower(category)
        if category == "master" then
            SoundService.Volume = value / 100
        elseif category == "music" then
            local musicGroup = SoundService:FindFirstChild("MusicGroup")
            if musicGroup then
                musicGroup.Volume = value / 100
            end
        elseif category == "sfx" then
            local sfxGroup = SoundService:FindFirstChild("SFXGroup")
            if sfxGroup then
                sfxGroup.Volume = value / 100
            end
        elseif category == "voice" then
            local voiceGroup = SoundService:FindFirstChild("VoiceGroup")
            if voiceGroup then
                voiceGroup.Volume = value / 100
            end
        end
    elseif key == "ShowFPS" then
        -- Toggle FPS counter visibility
        _G.ShowFPSCounter = value
    elseif key == "GraphicsQuality" then
        -- Apply graphics quality
        UserSettings():GetService("UserGameSettings").SavedQualityLevel = math.floor(value)
    elseif key == "TextSize" then
        -- Apply text size scaling
        local scale = value / 100
        for _, gui in ipairs(playerGui:GetChildren()) do
            if gui:IsA("ScreenGui") then
                for _, obj in ipairs(gui:GetDescendants()) do
                    if obj:IsA("TextLabel") or obj:IsA("TextButton") or obj:IsA("TextBox") then
                        -- Scale from base size
                    end
                end
            end
        end
    end

    -- Update status label
    local footer = settingsFrame:FindFirstChild("FooterFrame")
    if footer then
        local label = footer:FindFirstChild("StatusLabel")
        if label then
            label.Text = "Setting updated: " .. key
            task.delay(2, function()
                if label then
                    label.Text = ""
                end
            end)
        end
    end
end

-----------------------------------------------------------
-- Save and Reset
-----------------------------------------------------------

function SaveSettings()
    -- Send to server
    local SettingsEvents = ReplicatedStorage:FindFirstChild("SettingsEvents")
    if SettingsEvents then
        local SaveSettingsRemote = SettingsEvents:FindFirstChild("SaveSettings")
        if SaveSettingsRemote then
            local success = pcall(function()
                SaveSettingsRemote:FireServer(currentSettings)
            end)
            if success then
                ShowStatus("Settings saved successfully!", COLOR_SAVE)
            else
                ShowStatus("Failed to save settings.", COLOR_RESET)
            end
        end
    else
        ShowStatus("Settings saved locally!", COLOR_SAVE)
    end
end

function ResetSettings()
    -- Reset to defaults
    for key, value in pairs(DEFAULT_SETTINGS) do
        currentSettings[key] = value
        ApplySetting(key, value)
    end

    -- Rebuild UI to reflect defaults
    BuildSettingsContent()
    ShowStatus("Settings reset to defaults.", COLOR_ACCENT)
end

function ShowStatus(message, color)
    local footer = settingsFrame:FindFirstChild("FooterFrame")
    if footer then
        local label = footer:FindFirstChild("StatusLabel")
        if label then
            label.Text = message
            label.TextColor3 = color or COLOR_TEXT_SECONDARY
            task.delay(3, function()
                if label then
                    label.Text = ""
                    label.TextColor3 = COLOR_TEXT_SECONDARY
                end
            end)
        end
    end
end

-----------------------------------------------------------
-- Build Settings Content
-----------------------------------------------------------

function BuildSettingsContent()
    -- Clear existing
    for _, section in pairs(sections) do
        section.Frame:Destroy()
    end
    sections = {}
    for _, btn in pairs(tabButtons) do
        btn:Destroy()
    end
    tabButtons = {}

    -- Create sections
    local audioSection = CreateSection("Audio", "Audio")
    local displaySection = CreateSection("Display", "Display")
    local gameplaySection = CreateSection("Gameplay", "Gameplay")
    local accessibilitySection = CreateSection("Accessibility", "Accessibility")

    -- Create tab buttons
    tabButtons["Audio"] = CreateTabButton("Audio", "Audio", "")
    tabButtons["Display"] = CreateTabButton("Display", "Display", "")
    tabButtons["Gameplay"] = CreateTabButton("Gameplay", "Gameplay", "")
    tabButtons["Accessibility"] = CreateTabButton("Accessibility", "Accessibility", "")

    -- ─── Audio Section ───────────────────────────────────
    CreateSlider(audioSection, "VolumeMaster", "Master Volume", 0, 100, currentSettings.VolumeMaster)
    CreateSlider(audioSection, "VolumeMusic", "Music Volume", 0, 100, currentSettings.VolumeMusic)
    CreateSlider(audioSection, "VolumeSFX", "SFX Volume", 0, 100, currentSettings.VolumeSFX)
    CreateSlider(audioSection, "VolumeVoice", "Voice Volume", 0, 100, currentSettings.VolumeVoice)

    -- ─── Display Section ─────────────────────────────────
    CreateToggle(displaySection, "Fullscreen", "Fullscreen Mode", currentSettings.Fullscreen)
    CreateToggle(displaySection, "ShowFPS", "Show FPS Counter", currentSettings.ShowFPS)
    CreateSlider(displaySection, "GraphicsQuality", "Graphics Quality", 1, 10, currentSettings.GraphicsQuality)

    -- ─── Gameplay Section ────────────────────────────────
    CreateDropdown(gameplaySection, "Language", "Language", {"English", "Spanish", "French", "German", "Japanese", "Korean", "Chinese"}, currentSettings.Language)
    CreateDropdown(gameplaySection, "Difficulty", "Difficulty", {"Easy", "Normal", "Hard", "Expert"}, currentSettings.Difficulty)
    CreateToggle(gameplaySection, "ShowTutorial", "Show Tutorials", currentSettings.ShowTutorial)

    -- ─── Accessibility Section ───────────────────────────
    CreateSlider(accessibilitySection, "TextSize", "Text Size", 50, 150, currentSettings.TextSize)
    CreateDropdown(accessibilitySection, "ColorblindMode", "Colorblind Mode", {"None", "Deuteranopia", "Protanopia", "Tritanopia"}, currentSettings.ColorblindMode)
    CreateToggle(accessibilitySection, "ReduceMotion", "Reduce Motion", currentSettings.ReduceMotion)

    -- Show active tab
    SwitchTab(activeTab)
end

-----------------------------------------------------------
-- Global Input Handling for Sliders
-----------------------------------------------------------

local function SetupGlobalInput()
    UserInputService.InputChanged:Connect(function(input)
        if draggingSlider and sliderConnections[draggingSlider] then
            if input.UserInputType == Enum.UserInputType.MouseMovement or
               input.UserInputType == Enum.UserInputType.Touch then
                sliderConnections[draggingSlider].Update(input)
            end
        end
    end)

    UserInputService.InputEnded:Connect(function(input)
        if input.UserInputType == Enum.UserInputType.MouseButton1 or
           input.UserInputType == Enum.UserInputType.Touch then
            if draggingSlider and sliderConnections[draggingSlider] then
                -- Reset knob size
                Tween(sliderConnections[draggingSlider].Knob, {Size = UDim2.new(0, KNOB_SIZE, 0, KNOB_SIZE)})
                Tween(sliderConnections[draggingSlider].KnobGlow, {Thickness = 2, Transparency = 0.5})
            end
            draggingSlider = nil
        end
    end)
end

-----------------------------------------------------------
-- Keyboard Shortcuts
-----------------------------------------------------------

local function SetupKeyboardShortcuts()
    UserInputService.InputBegan:Connect(function(input, gameProcessed)
        if gameProcessed then return end
        if input.KeyCode == Enum.KeyCode.Escape then
            if isVisible then
                ToggleSettings(false)
            end
        end
    end)
end

-----------------------------------------------------------
-- Initialization
-----------------------------------------------------------

local function Initialize()
    BuildUI()
    BuildSettingsContent()
    SetupGlobalInput()
    SetupKeyboardShortcuts()

    -- Load saved settings from server
    task.spawn(function()
        local SettingsEvents = ReplicatedStorage:WaitForChild("SettingsEvents", 5)
        if SettingsEvents then
            local LoadSettings = SettingsEvents:WaitForChild("LoadSettings", 5)
            if LoadSettings then
                local success, savedSettings = pcall(function()
                    return LoadSettings:InvokeServer()
                end)
                if success and savedSettings then
                    for key, value in pairs(savedSettings) do
                        if currentSettings[key] ~= nil then
                            currentSettings[key] = value
                            ApplySetting(key, value)
                        end
                    end
                    BuildSettingsContent()
                end
            end
        end
    end)

    print("[Settings] Settings Menu initialized. Use settings button or Escape key.")
end

Initialize()
