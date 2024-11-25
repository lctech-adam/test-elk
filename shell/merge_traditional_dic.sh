#!/bin/bash

if [ -f .env ]; then
    source .env
else
    echo ".env file not found."
    exit 1
fi

if [ -z "$ELK_VERSION" ]; then
    echo "ELK_VERSION environment variable is not set."
    exit 1
fi

PLUGIN_PATH="./es/plugins/elasticsearch-analysis-ik-$ELK_VERSION/config"
echo "PLUGIN_PATH=$PLUGIN_PATH"

TMP_DIR="$PLUGIN_PATH/tmp"
echo "TMP_DIR=$TMP_DIR"

mkdir -p "$TMP_DIR"

for dic_file in $PLUGIN_PATH/*.dic; do
    if [[ "$dic_file" =~ \.dic$ ]]; then
        base_name=$(basename "$dic_file" .dic)
        
        echo "Processing $dic_file..."
        opencc -c s2twp.json -i "$dic_file" -o "$TMP_DIR/$base_name-tw.dic"
        
        cp "$dic_file" "$TMP_DIR/$base_name-cn.dic"

        cat "$TMP_DIR/$base_name-tw.dic" "$TMP_DIR/$base_name-cn.dic" | sort | uniq > "$PLUGIN_PATH/$base_name.dic"
    fi
done

rm -rf "$TMP_DIR"

echo "All dic files processed and updated."