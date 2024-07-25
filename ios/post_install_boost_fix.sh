#!/bin/bash

BOOST_HASH_FILE="Pods/boost/boost/container_hash/hash.hpp"

# Check if the file exists
if [ -f "$BOOST_HASH_FILE" ]; then
  echo "Modifying Boost hash.hpp for compatibility with C++17..."
  # sed -i '' 's/std::unary_function/std::function/g' "$BOOST_HASH_FILE"
  sed -i '' 's/std::unary_function/std::__unary_function/g' "$BOOST_HASH_FILE"
  # sed -i '' 's/<unary_function>/<functional>/g' "$BOOST_HASH_FILE"
else
  echo "Boost hash.hpp file not found!"
fi