# Google Tag Manager & GA4 Setup Guide

## 📊 Events Being Tracked

The app now pushes the following events to `dataLayer`:

### 1. Slider Change Event
```javascript
{
  event: 'slider_change',
  slider_value_minutes: 180,           // Raw minutes value
  slider_value_formatted: '3:00:00'    // Human-readable format
}
```

### 2. Unit Change Event
```javascript
{
  event: 'unit_change',
  unit: 'km'  // or 'mi'
}
```

## 🚀 GTM Setup Instructions

### Step 1: Set up your GTM Container ID
1. Go to [Google Tag Manager](https://tagmanager.google.com/)
2. Create a container or use existing one
3. Copy your GTM ID (format: `GTM-XXXXXXX`)
4. Add it to your `.env` file:
   ```
   VITE_GTM_ID=GTM-XXXXXXX
   ```

### Step 2: Create GA4 Configuration Tag
1. In GTM, go to **Tags** → **New**
2. Choose **Google Analytics: GA4 Configuration**
3. Enter your GA4 Measurement ID (format: `G-XXXXXXXXXX`)
4. Set trigger to **All Pages**
5. Save as "GA4 Configuration"

### Step 3: Create Custom Event Triggers

#### A. Slider Change Trigger
1. Go to **Triggers** → **New**
2. Choose **Custom Event**
3. Event name: `slider_change`
4. Save as "Slider Change"

#### B. Unit Change Trigger
1. Go to **Triggers** → **New**
2. Choose **Custom Event**
3. Event name: `unit_change`
4. Save as "Unit Change"

### Step 4: Create GA4 Event Tags

#### A. Slider Change Event Tag
1. Go to **Tags** → **New**
2. Choose **Google Analytics: GA4 Event**
3. Configuration Tag: Select your "GA4 Configuration"
4. Event Name: `slider_interaction`
5. Add Event Parameters:
   - Parameter Name: `slider_value_minutes` → Value: `{{slider_value_minutes}}`
   - Parameter Name: `slider_value_formatted` → Value: `{{slider_value_formatted}}`
6. Trigger: "Slider Change"
7. Save as "GA4 - Slider Change"

**Note:** You'll need to create Data Layer Variables first (see Step 5)

#### B. Unit Change Event Tag
1. Go to **Tags** → **New**
2. Choose **Google Analytics: GA4 Event**
3. Configuration Tag: Select your "GA4 Configuration"
4. Event Name: `unit_toggle`
5. Add Event Parameter:
   - Parameter Name: `unit_selected` → Value: `{{unit}}`
6. Trigger: "Unit Change"
7. Save as "GA4 - Unit Change"

### Step 5: Create Data Layer Variables

#### A. slider_value_minutes
1. Go to **Variables** → **User-Defined Variables** → **New**
2. Choose **Data Layer Variable**
3. Data Layer Variable Name: `slider_value_minutes`
4. Save as "slider_value_minutes"

#### B. slider_value_formatted
1. **Variables** → **New**
2. **Data Layer Variable**
3. Data Layer Variable Name: `slider_value_formatted`
4. Save as "slider_value_formatted"

#### C. unit
1. **Variables** → **New**
2. **Data Layer Variable**
3. Data Layer Variable Name: `unit`
4. Save as "unit"

### Step 6: Test Your Setup

1. In GTM, click **Preview**
2. Enter your website URL
3. Interact with the slider and unit toggle
4. Check the GTM debug panel - you should see:
   - `slider_change` events firing
   - `unit_change` events firing
   - Associated variables being populated

### Step 7: Publish Your Container

1. Click **Submit** in GTM
2. Add version name (e.g., "GA4 Marathon Pace Tracking")
3. Click **Publish**

## 📈 Viewing Data in GA4

After publishing, you can view the events in GA4:

1. Go to [Google Analytics](https://analytics.google.com/)
2. Navigate to **Reports** → **Realtime**
3. Interact with your site and see events appear in real-time
4. After 24-48 hours, check **Reports** → **Engagement** → **Events**

### Custom Reports You Can Create

- **Most Popular Target Times**: Group by `slider_value_formatted`
- **Unit Preference**: Count of `unit_toggle` events by `unit_selected`
- **User Engagement**: How many times users adjust the slider per session

## 🔧 Troubleshooting

### Events not showing in GTM Preview?
- Open browser console and check if `window.dataLayer` exists
- Verify `VITE_GTM_ID` is set correctly
- Check for JavaScript errors

### Events firing but not in GA4?
- Ensure GA4 Configuration tag is firing on all pages
- Check your GA4 Measurement ID is correct
- Wait 24-48 hours for data to process

### Too many slider events?
- Current implementation debounces to 150ms
- Adjust the timeout in `App.tsx` line 99 if needed

## 💡 Additional Tracking Ideas

Consider adding tracking for:
- Share button clicks
- Download image clicks
- Print button clicks
- Language changes
- Dark mode toggle
- Preset button clicks (already works but could add preset label)

Let me know if you need help implementing any of these!
