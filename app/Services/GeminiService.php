<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class GeminiService
{
    protected $apiKey;
    protected $endpoint = 'https://api.groq.com/openai/v1/chat/completions';
    protected $model = 'llama-3.3-70b-versatile';

    public function __construct()
    {
        $this->apiKey = env('GROQ_API_KEY');
    }

    public function analyzeIncident($title, $description, $type)
    {
        if (!$this->apiKey) {
            return [
                'summary' => 'AI Analysis is pending (API Key not set).',
                'advice' => 'Please contact the administrator to enable real-time AI safety guidance.'
            ];
        }

        $prompt = "You are a neighborhood safety AI expert. Analyze this incident:
        Title: {$title}
        Description: {$description}
        Type: {$type}

        Please provide your response in JSON format with exactly two keys:
        1. 'summary': A professional 1-sentence executive summary of the incident.
        2. 'advice': 3 concise, bullet-pointed safety action steps for residents.

        Do not include any other text in your response, only the raw JSON.";

        return $this->callGroq($prompt, true);
    }

    public function generateResponse($message, $systemPrompt)
    {
        if (!$this->apiKey) return "AI services are currently offline.";

        $result = $this->callGroq($message, false, $systemPrompt);
        return $result['text'] ?? "I'm sorry, I couldn't process that request.";
    }

    protected function callGroq($userMessage, $isJson = false, $systemPrompt = null)
    {
        try {
            $messages = [];

            if ($systemPrompt) {
                $messages[] = ['role' => 'system', 'content' => $systemPrompt];
            }

            $messages[] = ['role' => 'user', 'content' => $userMessage];

            $payload = [
                'model'       => $this->model,
                'messages'    => $messages,
                'temperature' => 0.7,
                'max_tokens'  => 1024,
            ];

            if ($isJson) {
                $payload['response_format'] = ['type' => 'json_object'];
            }

            $response = Http::timeout(15)
                ->withHeaders([
                    'Authorization' => 'Bearer ' . $this->apiKey,
                    'Content-Type'  => 'application/json',
                ])
                ->post($this->endpoint, $payload);

            if ($response->successful()) {
                $result = $response->json();
                $text = $result['choices'][0]['message']['content'] ?? '';

                if ($isJson) {
                    $text = str_replace(['```json', '```'], '', $text);
                    $data = json_decode(trim($text), true);
                    return [
                        'summary' => $data['summary'] ?? 'Analysis complete.',
                        'advice'  => $data['advice']  ?? 'Stay vigilant.',
                    ];
                }

                return ['text' => $text ?: "I am here to help. Please rephrase your question."];
            } else {
                \Log::error('Groq API Failure: ' . $response->status() . ' - ' . $response->body());
            }
        } catch (\Exception $e) {
            \Log::error('Groq Service Exception: ' . $e->getMessage());
        }

        return $isJson
            ? ['summary' => 'Error analyzing incident.', 'advice' => 'Please contact emergency services.']
            : ['text' => null];
    }
}
