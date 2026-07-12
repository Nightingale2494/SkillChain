# Admin Account Provisioning Guide

This guide details how to create and authorize an administrative account on the SkillChain platform.

---

## The Security Model

To prevent unauthorized access and privilege escalation:
1. **No Self-Registration**: The `admin` role is excluded from the client-side role onboarding selector on the Profile page.
2. **Onboarding Default**: Every user signing in with Google for the first time is assigned the `"unassigned"` role.
3. **Admin Verification**: Access to `/admin` is gated programmatically in the React Context layer and is allowed only if `profile.role === "admin"`.

---

## Steps to Provision an Admin Account for the Demo

Since authentication runs entirely client-side using Firebase SDKs, the initial admin role must be assigned manually in the Firestore console. Follow these steps:

### Step 1: Create the User Profile
1. Open the application locally or on staging.
2. Click **Sign In** in the navigation header and sign in with the Google account you wish to make an Admin.
3. Once authenticated, the application will automatically provision a document for your account in the `users` collection and redirect you to the `/profile` page (since your default role is `"unassigned"`).
4. Copy either your **Google UID** (visible in the URL or page context) or note the **Google Email** you signed in with.

### Step 2: Update the Role in Firestore Console
1. Navigate to the [Firebase Console](https://console.firebase.google.com/).
2. Select your SkillChain Firebase project.
3. In the left-hand navigation sidebar, click on **Build > Firestore Database**.
4. In the **Data** tab, click on the **`users`** collection.
5. Search for the document matching your Google UID.
6. Double-click the **`role`** field.
7. Change the value from `"unassigned"` (or whichever role is set) to **`"admin"`**.
8. Click **Update** to save the changes.

### Step 3: Verify Admin Access
1. Return to the SkillChain application.
2. If you are already logged in, refresh the page to fetch the updated profile metadata.
3. The warning banner redirecting you to `/profile` will disappear.
4. Click on **Admin** in the navigation bar or visit [http://localhost:3000/admin](http://localhost:3000/admin).
5. You should now see the dynamic Admin panel displaying live operational statistics (pending reviews, active verifiers, and contract deployments).
