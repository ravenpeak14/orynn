<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    /**
     * Send the request as the SPA would, so Sanctum starts a session for it.
     */
    protected function fromFrontend(): static
    {
        return $this->withHeader('Origin', 'http://localhost:5173');
    }
}
