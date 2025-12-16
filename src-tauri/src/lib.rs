use tokio::process::Command;

const HELPER_PATH: &str = "/usr/lib/aorus-cc/aorus-helper";

#[derive(serde::Serialize, serde::Deserialize, Clone)]
pub struct FanCurvePoint {
    temperature: u8,
    speed: u8,
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct SystemInfo {
    cpu_temp: i32,
    gpu_temp: i32,
    mb_temp: i32,
    cpu_fan_rpm: i32,
    gpu_fan_rpm: i32,
}

async fn read_sysfs(node: &str) -> Result<String, String> {
    let output = Command::new("pkexec")
        .arg(HELPER_PATH)
        .arg("read")
        .arg(node)
        .output()
        .await
        .map_err(|e| format!("Failed to execute helper: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("Helper failed: {}", stderr));
    }

    Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
}

async fn write_sysfs(node: &str, value: &str) -> Result<(), String> {
    let output = Command::new("pkexec")
        .arg(HELPER_PATH)
        .arg("write")
        .arg(node)
        .arg(value)
        .output()
        .await
        .map_err(|e| format!("Failed to execute helper: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("Helper failed: {}", stderr));
    }

    Ok(())
}

#[tauri::command]
async fn get_fan_mode() -> Result<i32, String> {
    read_sysfs("fan_mode")
        .await?
        .parse()
        .map_err(|e| format!("Parse error: {}", e))
}

#[tauri::command]
async fn set_fan_mode(mode: i32) -> Result<(), String> {
    write_sysfs("fan_mode", &mode.to_string()).await
}

#[tauri::command]
async fn get_fan_custom_speed() -> Result<i32, String> {
    read_sysfs("fan_custom_speed")
        .await?
        .parse()
        .map_err(|e| format!("Parse error: {}", e))
}

#[tauri::command]
async fn set_fan_custom_speed(speed: i32) -> Result<(), String> {
    write_sysfs("fan_custom_speed", &speed.to_string()).await
}

#[tauri::command]
async fn get_charge_mode() -> Result<i32, String> {
    read_sysfs("charge_mode")
        .await?
        .parse()
        .map_err(|e| format!("Parse error: {}", e))
}

#[tauri::command]
async fn set_charge_mode(mode: i32) -> Result<(), String> {
    write_sysfs("charge_mode", &mode.to_string()).await
}

#[tauri::command]
async fn get_charge_limit() -> Result<i32, String> {
    read_sysfs("charge_limit")
        .await?
        .parse()
        .map_err(|e| format!("Parse error: {}", e))
}

#[tauri::command]
async fn set_charge_limit(limit: i32) -> Result<(), String> {
    write_sysfs("charge_limit", &limit.to_string()).await
}

#[tauri::command]
async fn get_battery_cycle() -> Result<i32, String> {
    read_sysfs("battery_cycle")
        .await?
        .parse()
        .map_err(|e| format!("Parse error: {}", e))
}

#[tauri::command]
async fn get_gpu_boost() -> Result<i32, String> {
    read_sysfs("gpu_boost")
        .await?
        .parse()
        .map_err(|e| format!("Parse error: {}", e))
}

#[tauri::command]
async fn set_gpu_boost(mode: i32) -> Result<(), String> {
    write_sysfs("gpu_boost", &mode.to_string()).await
}

#[tauri::command]
async fn get_usb_charge_s3() -> Result<i32, String> {
    read_sysfs("usb_charge_s3_toggle")
        .await?
        .parse()
        .map_err(|e| format!("Parse error: {}", e))
}

#[tauri::command]
async fn get_usb_charge_s4() -> Result<i32, String> {
    read_sysfs("usb_charge_s4_toggle")
        .await?
        .parse()
        .map_err(|e| format!("Parse error: {}", e))
}

#[tauri::command]
async fn get_fan_curve_point(index: u8) -> Result<FanCurvePoint, String> {
    write_sysfs("fan_curve_index", &index.to_string()).await?;
    let data = read_sysfs("fan_curve_data").await?;
    let parts: Vec<&str> = data.split_whitespace().collect();

    if parts.len() != 2 {
        return Err("Invalid fan curve data format".to_string());
    }

    Ok(FanCurvePoint {
        temperature: parts[0]
            .parse()
            .map_err(|e| format!("Parse error: {}", e))?,
        speed: parts[1]
            .parse()
            .map_err(|e| format!("Parse error: {}", e))?,
    })
}

#[tauri::command]
async fn set_fan_curve_point(index: u8, temperature: u8, speed: u8) -> Result<(), String> {
    write_sysfs("fan_curve_index", &index.to_string()).await?;
    let data = (speed as u16 * 256) + temperature as u16;
    write_sysfs("fan_curve_data", &data.to_string()).await
}

#[tauri::command]
async fn get_all_fan_curve_points() -> Result<Vec<FanCurvePoint>, String> {
    let mut points = Vec::new();
    for i in 0..15 {
        match get_fan_curve_point(i).await {
            Ok(point) => points.push(point),
            Err(_) => break,
        }
    }
    Ok(points)
}

#[tauri::command]
fn get_system_info() -> Result<SystemInfo, String> {
    let hwmon_base = "/sys/class/hwmon";
    let mut temps = (0, 0, 0);
    let mut rpms = (0, 0);

    if let Ok(entries) = std::fs::read_dir(hwmon_base) {
        for entry in entries.flatten() {
            let path = entry.path();
            if let Some(name) = path.file_name().and_then(|n| n.to_str())
                && name.starts_with("hwmon")
            {
                if let Ok(temp1) = std::fs::read_to_string(path.join("temp1_input")) {
                    temps.0 = temp1.trim().parse::<i32>().unwrap_or(0) / 1000;
                }
                if let Ok(temp2) = std::fs::read_to_string(path.join("temp2_input")) {
                    temps.1 = temp2.trim().parse::<i32>().unwrap_or(0) / 1000;
                }
                if let Ok(temp3) = std::fs::read_to_string(path.join("temp3_input")) {
                    temps.2 = temp3.trim().parse::<i32>().unwrap_or(0) / 1000;
                }
                if let Ok(fan1) = std::fs::read_to_string(path.join("fan1_input")) {
                    rpms.0 = fan1.trim().parse().unwrap_or(0);
                }
                if let Ok(fan2) = std::fs::read_to_string(path.join("fan2_input")) {
                    rpms.1 = fan2.trim().parse().unwrap_or(0);
                }
            }
        }
    }

    Ok(SystemInfo {
        cpu_temp: temps.0,
        gpu_temp: temps.1,
        mb_temp: temps.2,
        cpu_fan_rpm: rpms.0,
        gpu_fan_rpm: rpms.1,
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_fan_mode,
            set_fan_mode,
            get_fan_custom_speed,
            set_fan_custom_speed,
            get_charge_mode,
            set_charge_mode,
            get_charge_limit,
            set_charge_limit,
            get_battery_cycle,
            get_gpu_boost,
            set_gpu_boost,
            get_usb_charge_s3,
            get_usb_charge_s4,
            get_fan_curve_point,
            set_fan_curve_point,
            get_all_fan_curve_points,
            get_system_info,
        ])
        .run(tauri::generate_context!())
        .expect("error while running the application");
}
