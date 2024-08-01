<?php

use Illuminate\Database\Schema\Blueprint;

use Flarum\Database\Migration;

return Migration::createTable(
    'websocket_user_state',
    function (Blueprint $table) {
        $table->increments('id');
        $table->timestamps();
        $table->integer('user_id')->unsigned();
        $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        $table->string("name");
        $table->string("path");
        $table->text("data")->nullable();
    }
);