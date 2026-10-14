<?php

namespace App\Exceptions;

use RuntimeException;

/** A friendly, player-facing refusal ("Not hungry right now", "Not enough coins"...). */
class GameException extends RuntimeException {}
