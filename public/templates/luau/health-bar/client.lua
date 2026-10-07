--[[
    Health Bar - Client Side
    A compact health bar with tweened fill, damage flash, and low-health pulse
    Features: Smooth health transitions, damage feedback, low-health warning, cartoon style
]]

-- Services
local Players = game:GetService("Players")
local TweenService = game:GetService("TweenService")
local RunService = game:GetService("RunService")

local player = Players.LocalPlayer
local playerGui = player:WaitForChild("PlayerGui")

-- Constants
local HEALTH_BAR_WIDTH = 280
local HEALTH_BAR_HEIGHT = 28
local HEALTH_CONTAINER_SIZE = UDim2.new(0, 340, 0, 60)
local HEALTH_CONTAINER_POSITION = UDim2.new(0, 20, 1, -80) -- Bottom-left for mobile
local LOW_HEALTH_THRESHOLD = 0.25 -- 25% health
local CRITICAL_HEALTH_THRESHOLD = 0.10 -- 10% health
local DAMAGE_FLASH_DURATION = 0.3
local HEAL_FLASH_DURATION = 0.4
local HEALTH_TWEEN_DURATION = 0.2

-- Colors
local COLOR_BG = Color3.fromRGB(30, 30, 40)
local COLOR_BAR_BG = Color3.fromRGB(60, 60, 70)
local COLOR_HEALTH_HIGH = Color3.fromRGB(50, 220, 80) -- Green
local COLOR_HEALTH_MID = Color3.fromRGB(255, 200, 30) -- Yellow
local COLOR_HEALTH_LOW = Color3.fromRGB(255, 60, 50) -- Red
local COLOR_HEALTH_CRITICAL = Color3.fromRGB(200, 0, 0) -- Dark Red
local COLOR_TEXT_PRIMARY = Color3.fromRGB(255, 255, 255)
local COLOR_TEXT_SHADOW = Color3.fromRGB(0, 0, 0)
local COLOR_DAMAGE = Color3.fromRGB(255, 0, 0)
local COLOR_HEAL = Color3.fromRGB(50, 255, 100)
local COLOR_SHIELD = Color3.fromRGB(80, 150, 255)

-- Tween presets
local tweenInfoHealth = TweenInfo.new(HEALTH_TWEEN_DURATION, Enum.EasingStyle.Quad, Enum.EasingDirection.Out)
local tweenInfoDamage = TweenInfo.new(DAMAGE_FLASH_DURATION, Enum.EasingStyle.Quad, Enum.EasingDirection.Out)
local tweenInfoHeal = TweenInfo.new(HEAL_FLASH_DURATION, Enum.EasingStyle.Quad, Enum.EasingDirection.Out)
local tweenInfoPulse = TweenInfo.new(0.4, Enum.EasingStyle.Sine, Enum.EasingDirection.InOut, -1, true)
local tweenInfoFloat = TweenInfo.new(1.0, Enum.EasingStyle.Quad, Enum.EasingDirection.Out)
local tweenInfoScale = TweenInfo.new(0.15, Enum.EasingStyle.Back, Enum.EasingDirection.Out)

-- State
local currentHealth = 100
local maxHealth = 100
local isLowHealth = false
local isCriticalHealth = false
local healthConnection = nil
local shieldAmount = 0
local maxShield = 0

-- GUI References
local healthGui, healthContainer, healthBarBg, healthBarFill
local healthBarOverlay, healthText, heartIcon, damageFlash
local lowHealthVignette, healEffect, healthChangeBar, damageNumberContainer

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
    local info = tweenInfoOverride or tweenInfoHealth
    local tween = TweenService:Create(instance, info, properties)
    tween:Play()
    return tween
end

local function GetHealthColor(healthPercent)
    if healthPercent <= CRITICAL_HEALTH_THRESHOLD then
        return COLOR_HEALTH_CRITICAL
    elseif healthPercent <= LOW_HEALTH_THRESHOLD then
        return COLOR_HEALTH_LOW
    elseif healthPercent <= 0.6 then
        -- Interpolate between yellow and red
        local t = (healthPercent - LOW_HEALTH_THRESHOLD) / (0.6 - LOW_HEALTH_THRESHOLD)
        return COLOR_HEALTH_LOW:Lerp(COLOR_HEALTH_MID, math.max(0, t))
    elseif healthPercent <= 0.9 then
        -- Interpolate between green and yellow
        local t = (healthPercent - 0.6) / (0.9 - 0.6)
        return COLOR_HEALTH_MID:Lerp(COLOR_HEALTH_HIGH, math.max(0, t))
    end
    return COLOR_HEALTH_HIGH
end

-----------------------------------------------------------
-- UI Construction
-----------------------------------------------------------

local function BuildUI()
    -- ScreenGui
    healthGui = Create("ScreenGui", {
        Name = "HealthBarGui",
        ResetOnSpawn = false,
        ZIndexBehavior = Enum.ZIndexBehavior.Sibling,
        Parent = playerGui,
    })

    -- Health Container (main holder)
    healthContainer = Create("Frame", {
        Name = "HealthContainer",
        Size = HEALTH_CONTAINER_SIZE,
        Position = HEALTH_CONTAINER_POSITION,
        AnchorPoint = Vector2.new(0, 1),
        BackgroundColor3 = COLOR_BG,
        BackgroundTransparency = 0.3,
        BorderSizePixel = 0,
        ZIndex = 10,
        Parent = healthGui,
    })

    Create("UICorner", {
        CornerRadius = UDim.new(0, 16),
        Parent = healthContainer,
    })

    -- Heart Icon
    heartIcon = Create("ImageLabel", {
        Name = "HeartIcon",
        Size = UDim2.new(0, 40, 0, 40),
        Position = UDim2.new(0, 10, 0.5, 0),
        AnchorPoint = Vector2.new(0, 0.5),
        BackgroundColor3 = Color3.fromRGB(255, 80, 80),
        BackgroundTransparency = 0,
        BorderSizePixel = 0,
        Image = "rbxassetid://7072718363", -- Heart icon
        ImageColor3 = Color3.fromRGB(255, 100, 100),
        ZIndex = 14,
        Parent = healthContainer,
    })

    Create("UICorner", {
        CornerRadius = UDim.new(1, 0),
        Parent = heartIcon,
    })

    -- Health Bar Background
    healthBarBg = Create("Frame", {
        Name = "HealthBarBackground",
        Size = UDim2.new(0, HEALTH_BAR_WIDTH, 0, HEALTH_BAR_HEIGHT),
        Position = UDim2.new(0, 60, 0.5, -HEALTH_BAR_HEIGHT/2),
        BackgroundColor3 = COLOR_BAR_BG,
        BorderSizePixel = 0,
        ZIndex = 11,
        Parent = healthContainer,
    })

    Create("UICorner", {
        CornerRadius = UDim.new(0, 14),
        Parent = healthBarBg,
    })

    -- Health Change Bar (shows delayed damage - "ghost" bar)
    healthChangeBar = Create("Frame", {
        Name = "HealthChangeBar",
        Size = UDim2.new(1, 0, 1, 0),
        BackgroundColor3 = COLOR_HEALTH_HIGH,
        BackgroundTransparency = 0.4,
        BorderSizePixel = 0,
        ZIndex = 11,
        Parent = healthBarBg,
    })

    Create("UICorner", {
        CornerRadius = UDim.new(0, 14),
        Parent = healthChangeBar,
    })

    -- Health Bar Fill
    healthBarFill = Create("Frame", {
        Name = "HealthBarFill",
        Size = UDim2.new(1, 0, 1, 0),
        BackgroundColor3 = COLOR_HEALTH_HIGH,
        BorderSizePixel = 0,
        ZIndex = 12,
        Parent = healthBarBg,
    })

    Create("UICorner", {
        CornerRadius = UDim.new(0, 14),
        Parent = healthBarFill,
    })

    -- Gradient for health fill
    local healthGradient = Create("UIGradient", {
        Color = ColorSequence.new({
            ColorSequenceKeypoint.new(0, Color3.fromRGB(255, 255, 255)),
            ColorSequenceKeypoint.new(0.3, Color3.fromRGB(200, 255, 200)),
            ColorSequenceKeypoint.new(1, COLOR_HEALTH_HIGH),
        }),
        Rotation = 90,
        Transparency = NumberSequence.new({
            NumberSequenceKeypoint.new(0, 0.7),
            NumberSequenceKeypoint.new(0.5, 0.9),
            NumberSequenceKeypoint.new(1, 0.6),
        }),
        Parent = healthBarFill,
    })

    -- Health Bar Overlay (shine effect)
    healthBarOverlay = Create("Frame", {
        Name = "HealthBarOverlay",
        Size = UDim2.new(1, 0, 0.5, 0),
        Position = UDim2.new(0, 0, 0, 0),
        BackgroundColor3 = Color3.fromRGB(255, 255, 255),
        BackgroundTransparency = 0.8,
        BorderSizePixel = 0,
        ZIndex = 13,
        Parent = healthBarFill,
    })

    Create("UICorner", {
        CornerRadius = UDim.new(0, 14),
        Parent = healthBarOverlay,
    })

    local overlayGradient = Create("UIGradient", {
        Color = ColorSequence.new({
            ColorSequenceKeypoint.new(0, Color3.fromRGB(255, 255, 255)),
            ColorSequenceKeypoint.new(1, Color3.fromRGB(255, 255, 255)),
        }),
        Transparency = NumberSequence.new({
            NumberSequenceKeypoint.new(0, 0.3),
            NumberSequenceKeypoint.new(0.5, 0.6),
            NumberSequenceKeypoint.new(1, 1),
        }),
        Parent = healthBarOverlay,
    })

    -- Health Text
    healthText = Create("TextLabel", {
        Name = "HealthText",
        Size = UDim2.new(0, HEALTH_BAR_WIDTH, 0, HEALTH_BAR_HEIGHT),
        Position = UDim2.new(0, 60, 0.5, -HEALTH_BAR_HEIGHT/2),
        BackgroundTransparency = 1,
        Text = "100 / 100",
        TextColor3 = COLOR_TEXT_PRIMARY,
        TextSize = 14,
        Font = Enum.Font.GothamBold,
        TextXAlignment = Enum.TextXAlignment.Center,
        TextYAlignment = Enum.TextYAlignment.Center,
        TextStrokeColor3 = COLOR_TEXT_SHADOW,
        TextStrokeTransparency = 0.5,
        ZIndex = 15,
        Parent = healthContainer,
    })

    -- Damage Number Container
    damageNumberContainer = Create("Frame", {
        Name = "DamageNumberContainer",
        Size = UDim2.new(1, 0, 1, 0),
        Position = UDim2.new(0, 0, 0, 0),
        BackgroundTransparency = 1,
        ZIndex = 20,
        Parent = healthContainer,
    })

    -- Damage Flash (full screen overlay)
    damageFlash = Create("Frame", {
        Name = "DamageFlash",
        Size = UDim2.new(1, 0, 1, 0),
        Position = UDim2.new(0, 0, 0, 0),
        BackgroundColor3 = COLOR_DAMAGE,
        BackgroundTransparency = 1,
        BorderSizePixel = 0,
        Visible = false,
        ZIndex = 100,
        Parent = healthGui,
    })

    -- Low Health Vignette
    lowHealthVignette = Create("ImageLabel", {
        Name = "LowHealthVignette",
        Size = UDim2.new(1, 0, 1, 0),
        Position = UDim2.new(0, 0, 0, 0),
        BackgroundTransparency = 1,
        Image = "rbxassetid://4996891970", -- Vignette texture
        ImageColor3 = COLOR_DAMAGE,
        ImageTransparency = 1,
        ScaleType = Enum.ScaleType.Stretch,
        Visible = false,
        ZIndex = 90,
        Parent = healthGui,
    })

    -- Heal Effect (green flash)
    healEffect = Create("Frame", {
        Name = "HealEffect",
        Size = UDim2.new(0, HEALTH_BAR_WIDTH + 10, 0, HEALTH_BAR_HEIGHT + 10),
        Position = UDim2.new(0, 55, 0.5, -(HEALTH_BAR_HEIGHT+10)/2),
        BackgroundColor3 = COLOR_HEAL,
        BackgroundTransparency = 1,
        BorderSizePixel = 0,
        Visible = false,
        ZIndex = 16,
        Parent = healthContainer,
    })

    Create("UICorner", {
        CornerRadius = UDim.new(0, 18),
        Parent = healEffect,
    })
end

-----------------------------------------------------------
-- Floating Damage Numbers
-----------------------------------------------------------

local function ShowFloatingNumber(amount, isHeal, isCrit)
    local label = Create("TextLabel", {
        Name = "DamageNumber",
        Size = UDim2.new(0, 100, 0, 30),
        Position = UDim2.new(0, math.random(60, HEALTH_BAR_WIDTH - 40), 0.5, -15),
        BackgroundTransparency = 1,
        Text = isHeal and "+" .. amount or "-" .. amount,
        TextColor3 = isHeal and COLOR_HEAL or (isCrit and COLOR_HEALTH_CRITICAL or COLOR_DAMAGE),
        TextSize = isCrit and 28 or 20,
        Font = isCrit and Enum.Font.GothamBlack or Enum.Font.GothamBold,
        TextXAlignment = Enum.TextXAlignment.Center,
        TextYAlignment = Enum.TextYAlignment.Center,
        TextStrokeColor3 = COLOR_TEXT_SHADOW,
        TextStrokeTransparency = 0.3,
        ZIndex = 21,
        Parent = damageNumberContainer,
    })

    -- Add "CRIT!" text for critical hits
    if isCrit and not isHeal then
        label.Text = "-" .. amount .. " CRIT!"
    end

    -- Float up and fade out animation
    Tween(label, {
        Position = label.Position - UDim2.new(0, 0, 0, 60),
        TextTransparency = 1,
    }, tweenInfoFloat)

    -- Scale bounce for crits
    if isCrit then
        label.Size = UDim2.new(0, 80, 0, 24)
        Tween(label, {Size = UDim2.new(0, 120, 0, 36)}, tweenInfoScale)
    end

    -- Cleanup
    task.delay(1.0, function()
        if label and label.Parent then
            label:Destroy()
        end
    end)
end

-----------------------------------------------------------
-- Health Update Logic
-----------------------------------------------------------

local lowHealthTween = nil
local pulseConnection = nil

local function SetLowHealthEffects(enabled)
    if enabled then
        -- Show vignette
        lowHealthVignette.Visible = true
        Tween(lowHealthVignette, {ImageTransparency = 0.3}, tweenInfoDamage)

        -- Start pulse animation on heart icon
        heartIcon.BackgroundColor3 = COLOR_HEALTH_LOW
        lowHealthTween = Tween(heartIcon, {Size = UDim2.new(0, 48, 0, 48)}, tweenInfoPulse)

        -- Start heartbeat effect
        if pulseConnection then
            pulseConnection:Disconnect()
        end
        local beatCount = 0
        pulseConnection = RunService.Heartbeat:Connect(function(dt)
            beatCount = beatCount + dt
            if beatCount >= 0.8 then
                beatCount = 0
                -- Flash vignette
                Tween(lowHealthVignette, {ImageTransparency = 0.15},
                    TweenInfo.new(0.15, Enum.EasingStyle.Quad, Enum.EasingDirection.Out))
                task.delay(0.15, function()
                    Tween(lowHealthVignette, {ImageTransparency = 0.3},
                        TweenInfo.new(0.3, Enum.EasingStyle.Quad, Enum.EasingDirection.Out))
                end)

                -- Shake container slightly
                local shakeOffset = math.random(-3, 3)
                Tween(healthContainer, {
                    Position = HEALTH_CONTAINER_POSITION + UDim2.new(0, shakeOffset, 0, 0)
                }, TweenInfo.new(0.05, Enum.EasingStyle.Quad))
                task.delay(0.05, function()
                    if healthContainer and healthContainer.Parent then
                        healthContainer.Position = HEALTH_CONTAINER_POSITION
                    end
                end)
            end
        end)
    else
        -- Hide vignette
        Tween(lowHealthVignette, {ImageTransparency = 1}, tweenInfoDamage)
        task.delay(DAMAGE_FLASH_DURATION, function()
            lowHealthVignette.Visible = false
        end)

        -- Stop pulse
        if lowHealthTween then
            lowHealthTween:Cancel()
            lowHealthTween = nil
        end
        Tween(heartIcon, {Size = UDim2.new(0, 40, 0, 40)}, tweenInfoHealth)
        heartIcon.BackgroundColor3 = Color3.fromRGB(255, 80, 80)

        if pulseConnection then
            pulseConnection:Disconnect()
            pulseConnection = nil
        end

        healthContainer.Position = HEALTH_CONTAINER_POSITION
    end
end

local function UpdateHealthDisplay(health, maxHealthValue)
    maxHealthValue = maxHealthValue or maxHealth
    local healthPercent = math.clamp(health / maxHealthValue, 0, 1)
    local previousHealthPercent = currentHealth / maxHealth

    currentHealth = health
    maxHealth = maxHealthValue

    -- Calculate health change
    local healthDelta = healthPercent - previousHealthPercent
    local isTakingDamage = healthDelta < 0
    local isHealing = healthDelta > 0

    -- Update health text
    healthText.Text = math.floor(health) .. " / " .. maxHealthValue

    -- Tween health bar fill
    Tween(healthBarFill, {
        Size = UDim2.new(healthPercent, 0, 1, 0)
    }, tweenInfoHealth)

    -- Update health bar color
    local targetColor = GetHealthColor(healthPercent)
    Tween(healthBarFill, {
        BackgroundColor3 = targetColor
    }, tweenInfoHealth)

    -- Update health change bar (delayed follow)
    task.delay(0.3, function()
        Tween(healthChangeBar, {
            Size = UDim2.new(healthPercent, 0, 1, 0)
        }, TweenInfo.new(0.5, Enum.EasingStyle.Quad, Enum.EasingDirection.Out))
    end)

    -- Damage feedback effects
    if isTakingDamage then
        local damageAmount = math.abs(math.floor((healthDelta) * maxHealthValue))
        local isCrit = math.abs(healthDelta) > 0.2 -- 20%+ damage is "critical"

        -- Show floating damage number
        ShowFloatingNumber(damageAmount, false, isCrit)

        -- Flash the screen red
        damageFlash.Visible = true
        damageFlash.BackgroundTransparency = 0
        Tween(damageFlash, {BackgroundTransparency = 1}, tweenInfoDamage)
        task.delay(DAMAGE_FLASH_DURATION, function()
            damageFlash.Visible = false
        end)

        -- Shake the health bar
        local shakeIntensity = isCrit and 8 or 4
        Tween(healthContainer, {
            Position = HEALTH_CONTAINER_POSITION + UDim2.new(0, shakeIntensity, 0, 0)
        }, TweenInfo.new(0.05))
        task.delay(0.05, function()
            Tween(healthContainer, {
                Position = HEALTH_CONTAINER_POSITION + UDim2.new(0, -shakeIntensity, 0, 0)
            }, TweenInfo.new(0.05))
            task.delay(0.05, function()
                Tween(healthContainer, {
                    Position = HEALTH_CONTAINER_POSITION
                }, TweenInfo.new(0.1))
            end)
        end)

        -- Brief white flash on the fill bar
        healthBarFill.BackgroundColor3 = COLOR_DAMAGE
        Tween(healthBarFill, {BackgroundColor3 = targetColor}, tweenInfoDamage)

    elseif isHealing then
        local healAmount = math.floor(healthDelta * maxHealthValue)
        ShowFloatingNumber(healAmount, true, false)

        -- Green flash effect
        healEffect.Visible = true
        healEffect.BackgroundTransparency = 0.3
        Tween(healEffect, {BackgroundTransparency = 1}, tweenInfoHeal)
        task.delay(HEAL_FLASH_DURATION, function()
            healEffect.Visible = false
        end)

        -- Pulse the heart icon
        Tween(heartIcon, {Size = UDim2.new(0, 48, 0, 48)}, tweenInfoScale)
        task.delay(0.15, function()
            Tween(heartIcon, {Size = UDim2.new(0, 40, 0, 40)}, tweenInfoHealth)
        end)
    end

    -- Low health effects
    local shouldBeLow = healthPercent <= LOW_HEALTH_THRESHOLD
    local shouldBeCritical = healthPercent <= CRITICAL_HEALTH_THRESHOLD

    if shouldBeLow and not isLowHealth then
        isLowHealth = true
        SetLowHealthEffects(true)
    elseif not shouldBeLow and isLowHealth then
        isLowHealth = false
        SetLowHealthEffects(false)
    end

    isCriticalHealth = shouldBeCritical

    -- Critical health - more intense effects
    if isCriticalHealth then
        -- Make vignette pulse faster
        heartIcon.BackgroundColor3 = COLOR_HEALTH_CRITICAL
    end

    -- Scale container based on health percentage (subtle size change)
    local scalePercent = 0.95 + (healthPercent * 0.1) -- 95% to 105%
    local targetWidth = HEALTH_CONTAINER_SIZE.X.Offset * scalePercent
    Tween(healthContainer, {
        Size = UDim2.new(0, targetWidth, 0, HEALTH_CONTAINER_SIZE.Y.Offset)
    }, TweenInfo.new(0.3, Enum.EasingStyle.Quad, Enum.EasingDirection.Out))
end

-----------------------------------------------------------
-- Humanoid Connection
-----------------------------------------------------------

local currentHumanoid = nil

local function ConnectHumanoid(humanoid)
    if currentHumanoid == humanoid then return end

    -- Disconnect previous
    if healthConnection then
        healthConnection:Disconnect()
        healthConnection = nil
    end

    currentHumanoid = humanoid
    maxHealth = humanoid.MaxHealth
    currentHealth = humanoid.Health

    -- Initialize display
    UpdateHealthDisplay(currentHealth, maxHealth)

    -- Connect to health changes
    healthConnection = humanoid.HealthChanged:Connect(function(newHealth)
        UpdateHealthDisplay(newHealth, humanoid.MaxHealth)
    end)

    -- Also listen for max health changes
    humanoid:GetPropertyChangedSignal("MaxHealth"):Connect(function()
        UpdateHealthDisplay(humanoid.Health, humanoid.MaxHealth)
    end)
end

local function OnCharacterAdded(character)
    local humanoid = character:WaitForChild("Humanoid", 10)
    if humanoid then
        ConnectHumanoid(humanoid)
    end
end

local function OnCharacterRemoving()
    if healthConnection then
        healthConnection:Disconnect()
        healthConnection = nil
    end
    currentHumanoid = nil
end

-----------------------------------------------------------
-- Initialization
-----------------------------------------------------------

local function Initialize()
    BuildUI()

    -- Connect to character events
    player.CharacterAdded:Connect(OnCharacterAdded)
    player.CharacterRemoving:Connect(OnCharacterRemoving)

    -- If character already exists
    if player.Character then
        OnCharacterAdded(player.Character)
    end

    print("[HealthBar] Health Bar initialized.")
end

Initialize()
