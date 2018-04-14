const path = require('path')
const HTMLPlugin = require('html-webpack-plugin') //编译html
const webpack = require('webpack')
const ExtractPlugin = require('extract-text-webpack-plugin') //非js文件打包另外的文件

const isDev = process.env.NODE_ENV === 'development'

const config = {
    target: 'web',
    entry: path.join(__dirname, 'src/index.js'),
    output: {
        filename: 'bundle.js',
        path: path.join(__dirname, 'dist')
    },
    module: {
        rules: [{
                test: /.vue$/,
                loader: 'vue-loader'
            },
             {
                test: /\.jsx$/,   //babelrc里配置转为jsx
                loader: 'babel-loader'   
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            },
            // {
            //     test: /\.styl$/,
            //     use: [
            //         'style-loader',
            //         'css-loader',
            //         'stylus-loader'
            //     ]
            // },
            {
                test: /\.(gif|jpg|jpeg|png|svg)$/,
                use: [{
                    loader: 'url-loader',
                    options: {
                        limit: 1024,
                        name: '[name]-aaa.[ext]'
                    }
                }]
            }
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: isDev ? '"development"' : '"production"'
            }
        }), //在这里定义了，在js里可以调用这里定义的变量 根据选择的不同环境打包不同的内容
        new HTMLPlugin()
    ]

}


if (isDev) {
       config.module.rules.push(
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
    )
    config.devtool ='#cheap-module-eval-source-map'   //定位错误 
    config.devServer = {
        port:8000,
        host: '0.0.0.0', //localhost  或者ip可以访问
        overlay: {
            errors: true //编译过程出错显示在浏览器中
        },
        open: false, //打开新页面
        //historyFallback: {}  //把没有映射的地址映射到主页

      
        hot: true //页面不刷新渲染出来
    }
    //不需要的信息的展示  
    // 热加载
    config.plugins.push(
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin()
    )
} else {
    config.entry = {
        app: path.join(__dirname, 'src/index.js'),
        vendor: ['vue']   //排除第三方的库，单独打包
    }
    config.output.filename = '[name].[chunkhash:8].js'
    config.module.rules.push(
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
    )
    config.plugins.push(
        new ExtractPlugin('styles.[contentHash:8].css'),
        new webpack.optimize.CommonsChunkPlugin({
            name:'vendor' ////排除第三方的库，单独打包 更上面的名字要一致
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'runtime'  //单独把webopack相关文件打包一个
        })
    )
}

module.exports = config