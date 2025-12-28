<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\api\AuthController;
use App\Http\Controllers\api\SubscriptionController;
use App\Http\Controllers\api\StoreController;
use App\Http\Controllers\api\ProductController;
use App\Http\Controllers\api\CategoryController;
use App\Http\Controllers\api\OrderController;
use App\Http\Controllers\api\DashboardController;
use App\Http\Controllers\api\PublicProductController;
use App\Http\Controllers\api\PublicStoreController;
use App\Http\Controllers\api\ImageUploadController;
use App\Http\Controllers\api\AddressController;
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);



Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

  
});

