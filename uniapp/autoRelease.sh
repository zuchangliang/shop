#!/bin/bash
# 文件原路径
srcPath="./unpackage/dist/build/web"
# 发布路径文件夹
releasePath="../server/public/mobile"

#删除发布目录下的mobile文件
rm -r $releasePath
echo "已删除 ==> $releasePath 下的目录文件"
mkdir $releasePath
echo "已新建 ==> $releasePath 目录"

# 复制打包目录内的文件到发布目录
cp -r $srcPath/* $releasePath
echo "已复制 $srcPath/* ==> $releasePath"

# uni-app H5 的基础样式由 static/index.css 输出，缺少它会导致原生 tabbar 等组件失去布局样式。
if [ -f "$releasePath/index.html" ] && [ -f "$releasePath/static/index.css" ]; then
    perl -0pi -e 's#</head>#<link href="/mobile/static/index.css" rel="stylesheet"></head># unless /\/mobile\/static\/index\.css/' "$releasePath/index.html"
    echo "已注入 ==> /mobile/static/index.css"
fi

cp $releasePath/../favicon.ico $releasePath
