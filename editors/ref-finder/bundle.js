// editors/ref-finder/bundle.js — 第三方编辑器插件（bare 类型）
//
// 安装后宿主调 mount(el, props, bridge) 把 UI 画进 el，unmount() 清理。
// 纯 DOM，不依赖 React / 宿主组件。
//
// 功能：输入资源名 → 在宿主提供的资源源（res：名 → xml/dataURL）里扫引用，
// 列出「谁引用了它 + 出处文件」。纯 dev tool 视角：帮你看清资源依赖。

(function () {
  "use strict";
  var root = null;
  var unmounted = false;

  function h(tag, attrs, children) {
    var el = document.createElement(tag);
    if (attrs) for (var k in attrs) el.setAttribute(k, attrs[k]);
    if (children) children.forEach(function (c) { el.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return el;
  }

  function mount(el, props, bridge) {
    if (unmounted) return;
    root = el;
    el.textContent = "";
    el.style.cssText = "flex:1;display:flex;flex-direction:column;height:100%;overflow:auto;padding:14px;font:13px/1.5 system-ui;color:var(--axv-on-surface,#222);";

    var query = (props && props.name) || "";
    var res = (props && props.res) || {};
    var resFiles = (props && props.resFiles) || {}; // 名 -> 相对路径

    var nameInput = h("input", { "style": "width:100%;padding:6px 8px;margin-bottom:8px;border:1px solid var(--axv-outline,#999);border-radius:6px;font:inherit;background:var(--axv-surface,#fff);color:inherit;" }, []);
    nameInput.value = query;
    nameInput.setAttribute("placeholder", "输入资源名（如 ic_launcher）");

    var out = h("div", { "style": "flex:1;overflow:auto;" }, []);

    function scan() {
      var q = nameInput.value.trim();
      out.textContent = "";
      if (!q) { out.appendChild(h("div", null, ["输入资源名后自动查找引用"])); return; }
      // 在资源源里找引用：哪个资源的 xml 文本里出现了 @drawable/q / @color/q / @string/q
      var found = [];
      var names = Object.keys(res);
      for (var i = 0; i < names.length; i++) {
        var rn = names[i];
        if (rn === q) continue;
        var txt = typeof res[rn] === "string" ? res[rn] : "";
        var pats = ["@drawable/" + q, "@mipmap/" + q, "@string/" + q, "@color/" + q, "@dimen/" + q, "R.drawable." + q, "R.mipmap." + q, "R.string." + q];
        var hit = pats.some(function (p) { return txt.indexOf(p) !== -1; });
        if (hit) found.push({ referrer: rn, file: resFiles[rn] || "", via: pats.filter(function (p) { return txt.indexOf(p) !== -1; })[0] });
      }
      if (found.length === 0) {
        out.appendChild(h("div", null, ["没有其它资源引用 \"" + q + "\"（查了 " + names.length + " 个资源）"]));
      } else {
        var head = h("div", null, [found.length + " 处引用："]);
        out.appendChild(head);
        found.forEach(function (f) {
          out.appendChild(h("div", { "style": "margin:6px 0;padding:6px 8px;border:1px solid var(--axv-outline-variant,#ddd);border-radius:6px;" }, [
            h("b", null, [f.referrer]),
            h("span", null, ["  →  " + f.via + (f.file ? "（" + f.file + "）" : "")])
          ]));
        });
      }
    }

    nameInput.addEventListener("input", scan);

    el.appendChild(h("div", null, [h("b", null, ["资源引用查找器"]) ]));
    el.appendChild(nameInput);
    el.appendChild(out);
    scan();
  }

  function unmount() {
    unmounted = true;
    if (root) root.textContent = "";
    root = null;
  }

  // 宿主通过「动态 import 这个 bundle 后」拿到 mount/unmount。
  // bare 插件不走 React，所以直接暴露全局命名空间，宿主按 manifest.id 查找。
  if (typeof window !== "undefined") {
    window.__axvBareEditors = window.__axvBareEditors || {};
    window.__axvBareEditors["axv:editor:ref-finder"] = { mount: mount, unmount: unmount };
  }
})();
