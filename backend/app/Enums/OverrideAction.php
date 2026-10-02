<?php

namespace App\Enums;

enum OverrideAction: string
{
    /** Skip this occurrence of the weekly template. */
    case Cancel = 'cancel';

    /** Change this occurrence only; the template stays untouched. */
    case Modify = 'modify';
}
