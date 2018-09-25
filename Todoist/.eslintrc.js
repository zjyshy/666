module.exports = {
    "env": {
        "browser": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaVersion": 2018
    },
    "rules": {
        "indent": [
            "error",
            1
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "double"
        ],
        "semi": [
            "error",
            "always"
        ],
        "comma-spacing": [
            "error"
        ],
        "key-spacing": [
            "error",
             { "beforeColon": false }],
        "no-console": [
            "off"
        ]
    },
    
}; 