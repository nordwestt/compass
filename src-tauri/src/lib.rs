use tauri_plugin_shell::ShellExt;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      app.shell().sidecar("binaries/corsproxy").unwrap().spawn().expect("Failed to spawn sidecar");
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
