const path = require('path')
const HTMLPlugin = require('html-webpack-plugin') //编译html
const webpack = require('webpack')
const ExtractPlugin = require('extract-text-webpack-plugin') //非js文件打包另外的文件

const merge = require('webpack-merge')
const baseConfig = require('./webpack.config.base.js')

const isDev = process.env.NODE_ENV === 'development'

let config;

const defaultPluins = [
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: isDev ? '"development"' : '"production"'
    }
  }),
  new HTMLPlugin()
]


const devServer = {
    port:8000,
    host: '0.0.0.0', //localhost  或者ip可以访问
    overlay: {
        errors: true //编译过程出错显示在浏览器中
    },
    open: false, //打开新页面
    //historyFallback: {}  //把没有映射的地址映射到主页
    hot: true //页面不刷新渲染出来
}


if (isDev) {
    config = merge(baseConfig, {
        devtool: '#cheap-module-eval-source-map',   //定位错误 
        module: {
            rules: [
                  {
                    test: /\.styl$/,  //开发时的方式
                    use: [
                        'style-loader',
                        'css-loader',
                        {
                            loader: 'postcss-loader', //加前缀的
                            options: {
                                sourceMap: true,
                            }
                        },
                        'stylus-loader'
                    ]
                },
            ]
        },
        devServer,
        plugins: defaultPluins.concat([
            new webpack.HotModuleReplacementPlugin(),
            new webpack.NoEmitOnErrorsPlugin()
        ])
    })
      
} else {

    config = merge(baseConfig, {
        entry: {
            app: path.join(__dirname, '../src/index.js'),
            vendor: ['vue']   //排除第三方的库，单独打包
        },
        output: {
            filename: '[name].[chunkhash:8].js'
        },
        module: {
            rules: [
                {
                    test: /.styl$/,
                    use: ExtractPlugin.extract({
                        fallback: 'style-loader',
                        use: [  
                            'css-loader',
                            {
                                loader: 'postcss-loader', //加前缀的
                                options: {
                                    sourceMap: true,
                                }
                            },
                            'stylus-loader'                                
                        ]
                    })
                }
            ]
        },
        plugins: defaultPluins.concat([
            new ExtractPlugin('styles.[contentHash:8].css'),
            new webpack.optimize.CommonsChunkPlugin({
                name:'vendor' ////排除第三方的库，单独打包 更上面的名字要一致
            }),
            new webpack.optimize.CommonsChunkPlugin({
                name: 'runtime'  //单独把webopack相关文件打包一个
            })
        ])
    }) 
}

module.exports = config