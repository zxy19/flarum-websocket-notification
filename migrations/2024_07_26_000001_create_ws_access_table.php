<?php

use Illuminate\Database\Schema\Blueprint;

use Flarum\Database\Migration;

return Migration::createTable(
    'websocket_access_token',
    function (Blueprint $table) {
        $table->increments('id');
        $table->timestamp("expires_at");
        $table->integer('user_id')->unsigned()->nullable();
        $table->string('token');
        $table->boolean('internal');
        $table->unique(['token']);
    }
);