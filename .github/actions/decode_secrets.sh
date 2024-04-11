#!/bin/bash

./bin/secrets unbuild -p $1


# echo "" >>.env
# while IFS= read -r line; do

#     if [[ -z "$line" ]] || [[ ${line:0:1} == '#' ]]; then
#         continue
#     fi

#     echo "$line" >>$GITHUB_ENV
# done <".env"
