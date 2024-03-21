#!/bin/bash

# ./bin/secrets unbuild -p $1

# cat .env

. $GITHUB_WORKSPACE/.env

variable_name="$1"

value="${!variable_name}"
echo $variable_name
echo $value

echo "$variable_name=$value" >>$GITHUB_ENV