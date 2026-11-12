# axv-plugins

android-xml-canvas 的插件包仓库（编译器 / 模板 / 依赖仓库）。

## 目录
- `ecj-d8-<ver>.zip`  编译器插件包（manifest.json + files/）
- `manifest.json`     最新版本的清单（下载校验用：size/sha256 均为 zip 内 .gz 文件的值）

## 用法
App 从仓库 raw 直链按需下载，下载后按 manifest 逐文件校验 sha256。
