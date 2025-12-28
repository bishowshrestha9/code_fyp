<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use App\Http\Controllers\api\AuthController;

Route::get('/', function () {
    return view('welcome');
});

// Google OAuth routes (must be in web.php for session support)
Route::get('/api/auth/google', [AuthController::class, 'redirectToGoogle']);
Route::get('/api/auth/google/callback', [AuthController::class, 'handleGoogleCallback']);

// Serve images from storage with CORS headers
Route::get('/storage/{path}', function ($path) {
    try {
        $filePath = Storage::disk('public')->path($path);
        
        if (!file_exists($filePath)) {
            abort(404);
        }
        
        $mimeType = mime_content_type($filePath);
        
        return response()->file($filePath, [
            'Content-Type' => $mimeType,
            'Access-Control-Allow-Origin' => '*',
            'Access-Control-Allow-Methods' => 'GET',
            'Access-Control-Allow-Headers' => 'Content-Type',
        ]);
    } catch (\Exception $e) {
        abort(404);
    }
})->where('path', '.*');
