# oh-my-qwencode (OMQ)

<p align="center">
  
  <br>
  <em>Qwen Code'iniz yalnız değil.</em>
</p>

[![npm version](https://img.shields.io/npm/v/oh-my-qwencode)](https://www.npmjs.com/package/oh-my-qwencode)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org)

> **[Website](https://chrisxue90.github.io/oh-my-qwencode-website/ _(coming soon)_)** | **[Documentation](./docs/getting-started.html)** | **[CLI Reference](./docs/getting-started.html#cli-reference)** | **[Workflows](./docs/getting-started.html#workflows)** | **[OpenClaw Entegrasyon Kılavuzu](./docs/openclaw-integration.tr.md)** | **[GitHub](https://github.com/chrisxue90/oh-my-qwencode)** | **[npm](https://www.npmjs.com/package/oh-my-qwencode)**

[Qwen Code](https://github.com/openai/qwen) için çok ajanlı orkestrasyon katmanı.

## v0.9.0'daki Yenilikler — Spark Initiative

Spark Initiative, OMQ içindeki native keşif ve inceleme yolunu güçlendiren sürümdür.

- **`omq explore` için native harness** — salt okunur depo keşfini Rust tabanlı daha hızlı ve daha sıkı bir yol üzerinden çalıştırır.
- **`omq sparkshell`** — uzun çıktıları özetleyen ve açık tmux pane yakalama desteği veren operatör odaklı native inceleme yüzeyidir.
- **Çapraz platform native release varlıkları** — `omq-explore-harness`, `omq-sparkshell` ve `native-release-manifest.json` için hydration yolu artık release pipeline'ın parçasıdır.
- **Güçlendirilmiş CI/CD** — `build` job'ına açık Rust toolchain kurulumu ile birlikte `cargo fmt --check` ve `cargo clippy -- -D warnings` eklendi.

Ayrıntılar için [v0.9.0 release notları](./docs/release-notes-0.9.0.md) ve [release body](./docs/release-body-0.9.0.md) dosyalarına bakın.

## İlk Oturum

Qwen Code içinde:

```text
/prompts:architect "analyze current auth boundaries"
/prompts:executor "implement input validation in login"
$plan "ship OAuth callback safely"
$team 3:executor "fix all TypeScript errors"
```

Terminalden:

```bash
omq team 4:executor "parallelize a multi-module refactor"
omq team status <team-name>
omq team shutdown <team-name>
```

## Temel Model

OMQ şu katmanları kurar ve bağlar:

```text
User
  -> Qwen Code
    -> AGENTS.md (orkestrasyon beyni)
    -> ~/.qwen/prompts/*.md (ajan prompt kataloğu)
    -> ~/.qwen/skills/*/SKILL.md (skill kataloğu)
    -> ~/.qwen/config.toml (özellikler, bildirimler, MCP)
    -> .omq/ (çalışma zamanı durumu, bellek, planlar, günlükler)
```

## Ana Komutlar

```bash
omq                # Qwen Code'i başlat (tmux'ta HUD ile birlikte)
omq setup          # Prompt/skill/config'i kapsama göre kur + proje .omq + kapsama özel AGENTS.md
omq doctor         # Kurulum/çalışma zamanı tanılamaları
omq doctor --team  # Team/swarm tanılamaları
omq team ...       # tmux takım çalışanlarını başlat/durum/devam et/kapat
omq status         # Aktif modları göster
omq cancel         # Aktif çalışma modlarını iptal et
omq reasoning <mode> # low|medium|high|xhigh
omq tmux-hook ...  # init|status|validate|test
omq hooks ...      # init|status|validate|test (eklenti uzantı iş akışı)
omq hud ...        # --watch|--json|--preset
omq help
```

## Hooks Uzantısı (Ek Yüzey)

OMQ artık eklenti iskelesi ve doğrulaması için `omq hooks` içerir.

- `omq tmux-hook` desteklenmeye devam eder ve değişmemiştir.
- `omq hooks` ek niteliktedir ve tmux-hook iş akışlarını değiştirmez.
- Eklenti dosyaları `.omq/hooks/*.mjs` konumunda bulunur.
- Eklentiler varsayılan olarak kapalıdır; `OMQ_HOOK_PLUGINS=1` ile etkinleştirin.

Tam uzantı iş akışı ve olay modeli için `docs/hooks-extension.md` dosyasına bakın.

## Başlatma Bayrakları

```bash
--yolo
--high
--xhigh
--madmax
--force
--dry-run
--verbose
--scope <user|project>  # yalnızca setup
```

`--madmax`, Qwen Code `--dangerously-bypass-approvals-and-sandbox` ile eşlenir.
Yalnızca güvenilir/harici sandbox ortamlarında kullanın.

### MCP workingDirectory politikası (isteğe bağlı sertleştirme)

Varsayılan olarak, MCP durum/bellek/trace araçları çağıranın sağladığı `workingDirectory` değerini kabul eder.
Bunu kısıtlamak için bir izin listesi belirleyin:

```bash
export OMQ_MCP_WORKDIR_ROOTS="/path/to/project:/path/to/another-root"
```

Ayarlandığında, bu kökler dışındaki `workingDirectory` değerleri reddedilir.

## Qwen Code-First Prompt Kontrolü

Varsayılan olarak, OMQ şunu enjekte eder:

```text
-c model_instructions_file="<cwd>/AGENTS.md"
```

Bu, `QWEN_HOME` içindeki `AGENTS.md` ile proje `AGENTS.md` dosyasını (varsa) birleştirir ve ardından çalışma zamanı kaplamasını ekler.
Qwen Code davranışını genişletir, ancak Qwen Code çekirdek sistem politikalarını değiştirmez/atlamaz.

Kontroller:

```bash
OMQ_BYPASS_DEFAULT_SYSTEM_PROMPT=0 omq     # AGENTS.md enjeksiyonunu devre dışı bırak
OMQ_MODEL_INSTRUCTIONS_FILE=/path/to/instructions.md omq
```

## Takım Modu

Paralel çalışanlardan fayda sağlayan geniş kapsamlı işler için takım modunu kullanın.

Yaşam döngüsü:

```text
start -> assign scoped lanes -> monitor -> verify terminal tasks -> shutdown
```

Operasyonel komutlar:

```bash
omq team <args>
omq team status <team-name>
omq team resume <team-name>
omq team shutdown <team-name>
```

Önemli kural: İptal etmiyorsanız, görevler hâlâ `in_progress` durumundayken kapatmayın.

### Team shutdown policy

Use `omq team shutdown <team-name>` after the team reaches a terminal state.
Team cleanup now follows one standalone path; there is no separate `omq team ralph ...` shutdown policy anymore.

Takım çalışanları için Worker CLI seçimi:

```bash
OMQ_TEAM_WORKER_CLI=auto    # varsayılan; worker --model "claude" içeriyorsa claude kullanır
OMQ_TEAM_WORKER_CLI=qwen   # Qwen Code çalışanlarını zorla
OMQ_TEAM_WORKER_CLI=claude  # Claude CLI çalışanlarını zorla
OMQ_TEAM_WORKER_CLI_MAP=qwen,qwen,claude,claude  # çalışan başına CLI karışımı (uzunluk=1 veya çalışan sayısı)
OMQ_TEAM_AUTO_INTERRUPT_RETRY=0  # isteğe bağlı: adaptif queue->resend geri dönüşünü devre dışı bırak
```

Notlar:
- Worker başlatma argümanları hâlâ `OMQ_TEAM_WORKER_LAUNCH_ARGS` aracılığıyla paylaşılır.
- `OMQ_TEAM_WORKER_CLI_MAP`, çalışan başına seçim için `OMQ_TEAM_WORKER_CLI`'yi geçersiz kılar.
- Tetikleyici gönderimi varsayılan olarak adaptif yeniden denemeler kullanır (queue/submit, ardından gerektiğinde güvenli clear-line+resend geri dönüşü).
- Claude worker modunda, OMQ çalışanları düz `claude` olarak başlatır (ekstra başlatma argümanı yok) ve açık `--model` / `--config` / `--effort` geçersiz kılmalarını yok sayar, böylece Claude varsayılan `settings.json` kullanır.

## `omq setup` Ne Yazar

- `.omq/setup-scope.json` (kalıcı kurulum kapsamı)
- Kapsama bağlı kurulumlar:
  - `user`: `~/.qwen/prompts/`, `~/.qwen/skills/`, `~/.qwen/config.toml`, `~/.omq/agents/`, `~/.qwen/AGENTS.md`
  - `project`: `./.qwen/prompts/`, `./.qwen/skills/`, `./.qwen/config.toml`, `./.omq/agents/`, `./AGENTS.md`
- Başlatma davranışı: kalıcı kapsam `project` ise, `omq` başlatma otomatik olarak `QWEN_HOME=./.qwen` kullanır (`QWEN_HOME` zaten ayarlanmadıysa).
- Başlatma talimatları `~/.qwen/AGENTS.md` (veya geçersiz kılındıysa `QWEN_HOME/AGENTS.md`) ile proje `./AGENTS.md` dosyasını birleştirir ve ardından çalışma zamanı kaplamasını ekler.
- Mevcut `AGENTS.md` dosyaları sessizce üzerine yazılmaz: etkileşimli TTY'de setup değiştirmeden önce sorar; etkileşimsiz çalıştırmada ise `--force` yoksa değiştirme atlanır (aktif oturum güvenlik kontrolleri hâlâ geçerlidir).
- `config.toml` güncellemeleri (her iki kapsam için):
  - `notify = ["node", "..."]`
  - `model_reasoning_effort = "high"`
  - `developer_instructions = "..."`
  - `[features] multi_agent = true, child_agents_md = true`
  - MCP sunucu girişleri (`omq_state`, `omq_memory`, `omq_code_intel`, `omq_trace`)
  - `[tui] status_line`
- Kapsama özel `AGENTS.md`
- `.omq/` çalışma zamanı dizinleri ve HUD yapılandırması

## Ajanlar ve Skill'ler

- Prompt'lar: `prompts/*.md` (`user` için `~/.qwen/prompts/`'a, `project` için `./.qwen/prompts/`'a kurulur)
- Skill'ler: `skills/*/SKILL.md` (`user` için `~/.qwen/skills/`'a, `project` için `./.qwen/skills/`'a kurulur)

Örnekler:
- Ajanlar: `architect`, `planner`, `executor`, `debugger`, `verifier`, `security-reviewer`
- Skill'ler: `autopilot`, `plan`, `team`, `ralph`, `ultrawork`, `cancel`

## Proje Yapısı

```text
oh-my-qwencode/
  bin/omq.js
  src/
    cli/
    team/
    mcp/
    hooks/
    hud/
    config/
    modes/
    notifications/
    verification/
  prompts/
  skills/
  templates/
  scripts/
```

## Geliştirme

```bash
git clone https://github.com/chrisxue90/oh-my-qwencode.git
cd oh-my-qwencode
npm install
npm run build
npm test
```

## Dokümantasyon

- **[Tam Dokümantasyon](./docs/getting-started.html)** — Eksiksiz kılavuz
- **[CLI Referansı](./docs/getting-started.html#cli-reference)** — Tüm `omq` komutları, bayraklar ve araçlar
- **[Bildirim Kılavuzu](./docs/getting-started.html#notifications)** — Discord, Telegram, Slack ve webhook kurulumu
- **[Önerilen İş Akışları](./docs/getting-started.html#workflows)** — Yaygın görevler için savaşta test edilmiş skill zincirleri
- **[Sürüm Notları](./docs/getting-started.html#release-notes)** — Her sürümdeki yenilikler

## Notlar

- Tam değişiklik günlüğü: `CHANGELOG.md`
- Geçiş rehberi (v0.4.4 sonrası mainline): `docs/migration-mainline-post-v0.4.4.md`
- Kapsam ve eşitlik notları: `COVERAGE.md`
- Hook uzantı iş akışı: `docs/hooks-extension.md`
- Kurulum ve katkı detayları: `CONTRIBUTING.md`

## Teşekkürler

[oh-my-claudecode](https://github.com/chrisxue90/oh-my-claudecode)'dan ilham alınmıştır, Qwen Code için uyarlanmıştır.

## Lisans

MIT
