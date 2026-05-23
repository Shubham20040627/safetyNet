<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    protected $fillable = [
        'user_id',
        'responder_id',
        'title',
        'description',
        'ai_summary',
        'ai_advice',
        'type',
        'priority',
        'location',
        'image',
        'datetime',
        'status',
        'latitude',
        'longitude',
        'is_simulated',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function responder()
    {
        return $this->belongsTo(User::class, 'responder_id');
    }
}
