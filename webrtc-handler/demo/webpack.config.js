const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = (env,argv) => {
    return {
        entry: './src/index.ts',
        output: {
            filename: 'index.js',
            path: path.resolve(__dirname, 'dist'),
            library: 'DemoClientLib',
            libraryTarget: 'umd',
            globalObject: 'this'
        },
        devtool: argv.mode === 'production' ? false : 'cheap-module-eval-source-map',
        plugins: [new CleanWebpackPlugin()],
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: [
                        {
                            loader: 'ts-loader'
                        },
                    ],
                },
            ],
        },
        resolve: {
            extensions: [ '.tsx', '.ts', '.js' ]
        },
        optimization: argv.mode === 'production' ? {
            minimize: true,
            minimizer: [new TerserPlugin()],
        } : {}
    };
};