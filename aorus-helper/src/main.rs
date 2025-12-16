use std::fs;
use std::path::PathBuf;

const BASE_PATH: &str = "/sys/devices/platform/aorus_laptop";

fn main() {
    let args: Vec<String> = std::env::args().collect();
    
    if args.len() < 2 {
        eprintln!("Usage: aorus-helper <command> [args...]");
        std::process::exit(1);
    }

    let result = match args[1].as_str() {
        "read" => {
            if args.len() < 3 {
                Err("Usage: aorus-helper read <attribute>".to_string())
            } else {
                read_attribute(&args[2])
            }
        }
        "write" => {
            if args.len() < 4 {
                Err("Usage: aorus-helper write <attribute> <value>".to_string())
            } else {
                write_attribute(&args[2], &args[3])
            }
        }
        "check" => {
            check_permissions()
        }
        _ => {
            Err(format!("Unknown command: {}", args[1]))
        }
    };

    match result {
        Ok(output) => {
            if !output.is_empty() {
                println!("{}", output);
            }
        }
        Err(e) => {
            eprintln!("Error: {}", e);
            std::process::exit(1);
        }
    }
}

fn read_attribute(attr: &str) -> Result<String, String> {
    validate_attribute(attr)?;
    
    let path = PathBuf::from(BASE_PATH).join(attr);
    fs::read_to_string(&path)
        .map(|s| s.trim().to_string())
        .map_err(|e| format!("Failed to read {}: {}", attr, e))
}

fn write_attribute(attr: &str, value: &str) -> Result<String, String> {
    validate_attribute(attr)?;
    validate_value(attr, value)?;
    
    let path = PathBuf::from(BASE_PATH).join(attr);
    fs::write(&path, value)
        .map(|_| String::new())
        .map_err(|e| format!("Failed to write {} to {}: {}", value, attr, e))
}

fn check_permissions() -> Result<String, String> {
    let path = PathBuf::from(BASE_PATH).join("fan_mode");
    
    match fs::read_to_string(&path) {
        Ok(_) => Ok("ok".to_string()),
        Err(e) => Err(format!("Permission check failed: {}", e))
    }
}

fn validate_attribute(attr: &str) -> Result<(), String> {
    const ALLOWED_ATTRS: &[&str] = &[
        "fan_mode",
        "fan_custom_speed",
        "charge_mode",
        "charge_limit",
        "gpu_boost",
        "usb_charge_s3_toggle",
        "usb_charge_s4_toggle",
        "battery_cycle",
        "fan_curve_index",
        "fan_curve_data",
    ];
    
    if ALLOWED_ATTRS.contains(&attr) {
        Ok(())
    } else {
        Err(format!("Attribute '{}' not allowed", attr))
    }
}

fn validate_value(attr: &str, value: &str) -> Result<(), String> {
    match attr {
        "fan_mode" => {
            let val: u8 = value.parse()
                .map_err(|_| "fan_mode must be 0-5")?;
            if val <= 5 {
                Ok(())
            } else {
                Err("fan_mode must be 0-5".to_string())
            }
        }
        "fan_custom_speed" => {
            let val: u8 = value.parse()
                .map_err(|_| "fan_custom_speed must be 25-100 and divisible by 5")?;
            if (25..=100).contains(&val) && val % 5 == 0 {
                Ok(())
            } else {
                Err("fan_custom_speed must be 25-100 and divisible by 5".to_string())
            }
        }
        "charge_mode" => {
            let val: u8 = value.parse()
                .map_err(|_| "charge_mode must be 0-1")?;
            if val <= 1 {
                Ok(())
            } else {
                Err("charge_mode must be 0-1".to_string())
            }
        }
        "charge_limit" => {
            let val: u8 = value.parse()
                .map_err(|_| "charge_limit must be 60-100")?;
            if (60..=100).contains(&val) {
                Ok(())
            } else {
                Err("charge_limit must be 60-100".to_string())
            }
        }
        "gpu_boost" => {
            let val: u8 = value.parse()
                .map_err(|_| "gpu_boost must be 0-3")?;
            if val <= 3 {
                Ok(())
            } else {
                Err("gpu_boost must be 0-3".to_string())
            }
        }
        "usb_charge_s3_toggle" | "usb_charge_s4_toggle" => {
            let val: u8 = value.parse()
                .map_err(|_| format!("{} must be 0 or 1", attr))?;
            if val <= 1 {
                Ok(())
            } else {
                Err(format!("{} must be 0 or 1", attr))
            }
        }
        "fan_curve_index" => {
            let val: u8 = value.parse()
                .map_err(|_| "fan_curve_index must be 0-14")?;
            if val < 15 {
                Ok(())
            } else {
                Err("fan_curve_index must be 0-14".to_string())
            }
        }
        "fan_curve_data" => {
            let _val: u16 = value.parse()
                .map_err(|_| "fan_curve_data must be a valid 16-bit number")?;
            Ok(())
        }
        _ => Ok(())
    }
}
