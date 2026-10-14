<?php

use Illuminate\Support\Facades\Schedule;

// Housekeeping for database sessions and cache.
Schedule::command('model:prune')->daily();
