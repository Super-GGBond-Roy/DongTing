import { Heart, ExternalLink, BookOpen, Mic, Shield } from 'lucide-react';
import { open } from '@tauri-apps/plugin-shell';

export function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          关于本项目
        </h1>
        <p className="text-lg text-gray-600">
          侗听
        </p>
      </div>

      <div className="space-y-8">
        <section className="p-6 bg-white rounded-xl border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="w-6 h-6 text-red-500" />
            <h2 className="text-xl font-semibold text-gray-800">项目目的</h2>
          </div>
          <p className="text-gray-600 leading-relaxed">
            本软件是一个公益开源的语言文化资料库，旨在保存和展示黔东南地区及其周边侗族语言、方言和文化资料。
            我们致力于记录和保护语言文化的多样性，让更多人能够了解和学习不同的语言文化。
          </p>
        </section>

        <section className="p-6 bg-white rounded-xl border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-800">资料来源</h2>
          </div>
          <p className="text-gray-600 leading-relaxed">
            所有语言资料由项目维护者整理、校对和发布。资料包括原语言文字、转写、中文释义、
            例句、文化说明、图片和真实录音。我们力求准确，但语言资料可能因地区和使用习惯而有差异。
          </p>
        </section>

        <section className="p-6 bg-white rounded-xl border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <Mic className="w-6 h-6 text-green-500" />
            <h2 className="text-xl font-semibold text-gray-800">录音说明</h2>
          </div>
          <p className="text-gray-600 leading-relaxed">
            所有发音均来自真实录音，不使用合成语音。每个词条通常包含两个音源，
            可以是不同性别或不同年龄段的发音，其中音源一采用北侗发音，音源二采用南侗发音。
            我们感谢所有参与录音的贡献者。
          </p>
        </section>

        <section className="p-6 bg-white rounded-xl border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <ExternalLink className="w-6 h-6 text-gray-800" />
            <h2 className="text-xl font-semibold text-gray-800">开源协议</h2>
          </div>
          <p className="text-gray-600 leading-relaxed mb-4">
            本项目采用 MIT 开源协议，欢迎自由使用、修改和分发。
            语言文化资料采用知识共享协议，请在使用时注明来源。
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => open('https://github.com/Super-GGBond-Roy/DongTing')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              GitHub 仓库
            </button>
          </div>
        </section>

        <section className="p-6 bg-white rounded-xl border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-purple-500" />
            <h2 className="text-xl font-semibold text-gray-800">文化尊重</h2>
          </div>
          <p className="text-gray-600 leading-relaxed">
            我们尊重所有语言文化社群。在整理和展示资料时，我们力求客观、准确，
            避免误解和不当使用。如果您发现任何问题或有改进建议，欢迎联系我们。
          </p>
        </section>
      </div>

      <div className="mt-12 text-center text-sm text-gray-400">
        <p>版本 0.1.0</p>
        <p className="mt-1">侗听</p>
      </div>
    </div>
  );
}
