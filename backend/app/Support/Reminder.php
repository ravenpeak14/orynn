<?php

namespace App\Support;

final class Reminder
{
    /**
     * Minutes before an activity. 0 means "no reminder"; on a schedule override
     * it explicitly switches off a reminder inherited from the template.
     */
    public const OPTIONS = [0, 5, 10, 15, 30, 60];
}
