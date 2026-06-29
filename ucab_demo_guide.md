# Ucab - Complete Demonstration Guide

This guide walks you through a complete, end-to-end test of the Ucab application. It covers everything from logging in to completing a ride, as both a User (Passenger) and a Driver.

---

## 🛑 Important Setup Rule
To test the app yourself on the same computer or phone, you **must** use two separate browser sessions so the accounts don't overwrite each other:
1. Open a **Normal Browser Tab** (for the User).
2. Open a **Private / Incognito Window** (for the Driver).

---

## Step 1: Login as Both Roles

### In your Normal Tab (The Passenger):
1. Navigate to the website.
2. Click **Login** in the top right.
3. Enter the test user credentials:
   - **Email:** `user@ucab.com`
   - **Password:** `user123`
4. Click **Sign In**. You will be redirected to the User Dashboard.

### In your Incognito Tab (The Driver):
1. Navigate to the website.
2. Click **Login** in the top right.
3. Enter the test driver credentials:
   - **Email:** `driver@ucab.com`
   - **Password:** `driver123`
4. Click **Sign In**. You will be redirected to the Driver Dashboard.

---

## Step 2: Driver Goes Online
1. In the **Driver Tab**, look for the toggle switch near the top right that says **"Offline"**.
2. Click it to switch it to **"Online"**. 
3. The dashboard will now show "Waiting for ride requests..." and your car is now visible on the map to users.

---

## Step 3: Passenger Books a Ride
1. Switch to the **User Tab**.
2. Click **Book Ride** in the top navigation.
3. Set your locations:
   - Click **"Use My Location"** for the pickup, OR click anywhere on the map to set a green Pickup Pin.
   - Click a different spot on the map to set a red Dropoff Pin.
4. Once both pins are set, a route line will appear, and the left side panel will show the estimated Distance, Time, and Fares for different vehicles (Auto, Bike, Sedan, SUV).
5. Select a vehicle type (e.g., Sedan).
6. Click the large purple **Confirm Booking** button.

---

## Step 4: Driver Accepts the Ride
1. Switch immediately to the **Driver Tab**.
2. An incoming ride request popup will appear on the screen, playing a sound. It will show the Passenger's pickup location and fare.
3. Click the green **Accept Ride** button.
4. The driver's screen updates to show the "Active Ride" view, displaying the Passenger's name and a map of the route.

---

## Step 5: Passenger Tracks the Ride
1. Switch to the **User Tab**.
2. The user's screen has now automatically updated to the "Ride Tracking" page!
3. You will see the Driver's Name, Vehicle Type, License Plate, and a **4-digit OTP code** prominently displayed.
4. *Note down this OTP code.*

---

## Step 6: Driver Starts the Ride
1. Switch to the **Driver Tab**.
2. Ask the passenger for the OTP. 
3. Type the **4-digit OTP code** into the input boxes on the Driver's screen.
4. Click **Verify OTP**.
5. The ride status changes to "In Progress".

---

## Step 7: Driver Completes the Ride
1. In the **Driver Tab**, the button at the bottom will now say **Complete Ride**.
2. Simulate driving to the destination, and then click **Complete Ride**.
3. The driver's screen clears the active ride and goes back to waiting for new requests. The driver's "Total Earnings" and "Total Rides" stats automatically increase!

---

## Step 8: Passenger Payment & Rating
1. Switch back to the **User Tab**.
2. The screen has automatically transitioned to the **Payment & Rating** screen.
3. It displays the final fare breakdown (Base Fare, Distance, Time).
4. Select a star rating (1 to 5) for the driver.
5. Leave a comment (e.g., "Great smooth ride!").
6. Click **Submit Payment & Rating**.
7. You are returned to the User Dashboard.

---

## Step 9: Check Histories & Logout
1. In the **User Tab**, click on **History** in the top navigation. You will see your newly completed ride in the list.
2. In the **Driver Tab**, scroll down to the **Recent Rides** section to see the completed ride logged there as well.
3. Finally, in both tabs, click your profile icon in the top right and select **Logout** to end the session.

---
**End of Demo.**
