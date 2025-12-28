<?php

namespace App\Http\Controllers\api;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;


class AuthController extends Controller
{
    public function login(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email',
                'password' => 'required'
            ]);


            $user = User::where('email', $request->email)->first();
            if (!$user) {
                return response()->json(['error' => 'User not found'], 404);
            }

            if (!Hash::check($request->password, $user->password)) {
                return response()->json(['error' => 'Invalid credentials'], 401);
            }

            $accessToken = $user->createToken('auth_token')->plainTextToken;

            // Configure cookie for cross-origin requests
            // For localhost development, use 'lax' (browsers may treat localhost ports as same-site)
            //dont use production for most of the time 
            // For production with HTTPS, use 'none' with secure=true
            $isProduction = env('APP_ENV') === 'production';
            $cookie = cookie(
                'auth_token',
                $accessToken,
                60 * 24 * 30, // 30 days for token expiration
                '/',
                null, // domain - null means current domain ( auto)
                $isProduction, // secure - true in production with HTTPS
                true, // httpOnly - prevents JavaScript access
                false, // raw
                $isProduction ? 'none' : 'lax' // sameSite - 'none' for production, 'lax' for localhost
            );

            return response()->json([
                'message' => 'Login successful',
                'access_token' => $accessToken,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'google_id' => $user->google_id,
                ]
            ], 200)
                ->withCookie($cookie)
                ->header('Access-Control-Allow-Credentials', 'true');
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function register(Request $request)
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users',
                'password' => 'required|string|min:8|confirmed',
            ]);

            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'user', // Set default role
            ]);

            // Auto-login the user after registration
            $accessToken = $user->createToken('auth_token')->plainTextToken;

            // Configure cookie for cross-origin requests
            $isProduction = env('APP_ENV') === 'production';
            $cookie = cookie(
                'auth_token',
                $accessToken,
                60 * 24 * 30, // 30 days
                '/',
                null,
                $isProduction,
                true,
                false,
                $isProduction ? 'none' : 'lax'
            );

            return response()->json([
                'message' => 'User registered successfully',
                'access_token' => $accessToken,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                ]
            ], 200)
                ->withCookie($cookie)
                ->header('Access-Control-Allow-Credentials', 'true');
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function me(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user) {
                return response()->json(['error' => 'Unauthenticated'], 401);
            }

            return response()->json([
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'google_id' => $user->google_id,
                    'phone' => $user->phone,
                    'avatar' => $user->avatar,
                    'address' => $user->address,
                    'city' => $user->city,
                    'state' => $user->state,
                    'zip_code' => $user->zip_code,
                    'country' => $user->country,
                    'date_of_birth' => $user->date_of_birth,
                    'created_at' => $user->created_at,
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function updateProfile(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user) {
                return response()->json(['error' => 'Unauthenticated'], 401);
            }

            $request->validate([
                'name' => 'sometimes|string|max:255',
                'phone' => 'sometimes|nullable|string|max:20',
                'avatar' => 'sometimes|nullable|string|max:500', // Path from image upload
                'address' => 'sometimes|nullable|string|max:500',
                'city' => 'sometimes|nullable|string|max:100',
                'state' => 'sometimes|nullable|string|max:100',
                'zip_code' => 'sometimes|nullable|string|max:20',
                'country' => 'sometimes|nullable|string|max:100',
                'date_of_birth' => 'sometimes|nullable|date',
            ]);

            $user->update($request->only([
                'name',
                'phone',
                'avatar',
                'address',
                'city',
                'state',
                'zip_code',
                'country',
                'date_of_birth',
            ]));

            return response()->json([
                'success' => true,
                'message' => 'Profile updated successfully',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'google_id' => $user->google_id,
                    'phone' => $user->phone,
                    'avatar' => $user->avatar,
                    'address' => $user->address,
                    'city' => $user->city,
                    'state' => $user->state,
                    'zip_code' => $user->zip_code,
                    'country' => $user->country,
                    'date_of_birth' => $user->date_of_birth,
                    'created_at' => $user->created_at,
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function updatePassword(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user) {
                return response()->json(['error' => 'Unauthenticated'], 401);
            }

            $request->validate([
                'current_password' => 'required|string',
                'new_password' => 'required|string|min:8',
                'confirm_password' => 'required|string|same:new_password',
            ]);

            // Check current password
            if (!Hash::check($request->current_password, $user->password)) {
                return response()->json(['error' => 'Current password is incorrect'], 400);
            }

            // Update password
            $user->update([
                'password' => Hash::make($request->new_password),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Password updated successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }


    public function logout(Request $request)
    {
        try {
            $user = $request->user();

            // Delete the current access token if user is authenticated
            if ($user) {
                $user->currentAccessToken()->delete();
            }

            // Delete the cookie with same configuration as login
            $isProduction = env('APP_ENV') === 'production';
            $cookie = cookie(
                'auth_token',
                '',
                -1, // Expire immediately
                '/',
                null,
                $isProduction,
                true,
                false,
                $isProduction ? 'none' : 'lax'
            );

            return response()->json(['message' => 'Logged out successfully'], 200)
                ->withCookie($cookie)
                ->header('Access-Control-Allow-Credentials', 'true');
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    //function for google OAuth functionality

    public function redirectToGoogle()
    {
        try {
            $url = Socialite::driver('google') //used laravel inbuilt socialite package for google oauth
                ->stateless()
                ->redirect()
                ->getTargetUrl();

            return response()->json([
                'url' => $url
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to generate Google OAuth URL: ' . $e->getMessage()
            ], 500);
        }
    }

    public function handleGoogleCallback(Request $request)
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();

            if (!$googleUser || !$googleUser->email) {
                throw new \Exception('Failed to retrieve user information from Google');
            }

            // Check if user exists by email
            $user = User::where('email', $googleUser->email)->first();

            if ($user) {
                // User exists, update google_id if not set
                if (!$user->google_id) {
                    $user->google_id = $googleUser->id;
                    $user->save();
                }
            } else {
                // Create new user
                $user = User::create([
                    'name' => $googleUser->name ?? $googleUser->email,
                    'email' => $googleUser->email,
                    'google_id' => $googleUser->id,
                    'password' => null, // OAuth users don't need password
                    'role' => 'user',
                    'email_verified_at' => now(),
                ]);
            }

            // Create token for the user
            $accessToken = $user->createToken('auth_token')->plainTextToken;

            // Configure cookie
            $isProduction = env('APP_ENV') === 'production';
            $cookie = cookie(
                'auth_token',
                $accessToken,
                60 * 24 * 30, // 30 days
                '/',
                null,
                $isProduction,
                true,
                false,
                $isProduction ? 'none' : 'lax'
            );

            // Redirect to frontend with token
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
            return redirect($frontendUrl . '/callback?token=' . $accessToken . '&user=' . base64_encode(json_encode([
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'google_id' => $user->google_id,
            ])))->withCookie($cookie); //this is where the user is redirected to the frontend

        } catch (\Exception $e) {
            // Log the error for debugging
            \Log::error('Google OAuth callback error: ' . $e->getMessage(), [
                'exception' => $e,
                'request' => $request->all(),
            ]);

            $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
            $errorMessage = $e->getMessage();
            return redirect($frontendUrl . '/login?error=' . urlencode('Google authentication failed: ' . $errorMessage));
        }
    }

}
