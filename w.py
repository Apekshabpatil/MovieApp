import requests
import tkinter as tk
from tkinter import messagebox, ttk
from PIL import Image, ImageTk
import io

# Weather Fetching Function
def get_weather():
    city_name = city_entry.get().strip()
    if not city_name:
        messagebox.showerror("Error", "Please enter a city name.")
        return

    API_KEY = "802e7173ad3a4031fa36fa13497438d2"  # Your API Key
    BASE_URL = "https://api.openweathermap.org/data/2.5/weather"

    params = {
        "q": city_name,
        "appid": API_KEY,
        "units": "metric"
    }

    try:
        response = requests.get(BASE_URL, params=params)
        data = response.json()

        if response.status_code == 200:
            city = data["name"]
            country = data["sys"]["country"]
            temp = data["main"]["temp"]
            humidity = data["main"]["humidity"]
            condition = data["weather"][0]["description"].title()
            icon_code = data["weather"][0]["icon"]

            # Update background color based on temperature
            if temp <= 10:
                root.configure(bg="#a2d2ff")  # Cold - light blue
            elif 10 < temp <= 25:
                root.configure(bg="#d9f99d")  # Pleasant - light green
            else:
                root.configure(bg="#ffadad")  # Hot - light red

            # Fetch and display weather icon
            icon_url = f"http://openweathermap.org/img/wn/{icon_code}@2x.png"
            icon_response = requests.get(icon_url)
            icon_img = Image.open(io.BytesIO(icon_response.content))
            icon_photo = ImageTk.PhotoImage(icon_img)
            weather_icon_label.config(image=icon_photo)
            weather_icon_label.image = icon_photo

            # Update text
            result_label.config(
                text=f"📍 {city}, {country}\n🌡 Temperature: {temp}°C\n💧 Humidity: {humidity}%\n☁ Condition: {condition}",
                foreground="#333",
                bg=root["bg"]
            )

        else:
            messagebox.showerror("Error", data.get("message", "Unable to fetch weather."))

    except Exception as e:
        messagebox.showerror("Error", f"Something went wrong:\n{e}")

# GUI Setup
root = tk.Tk()
root.title("Weather App")
root.geometry("420x400")
root.resizable(False, False)
root.configure(bg="#f7f7f7")

# Title
title_label = tk.Label(root, text="🌤 Weather App", font=("Helvetica", 18, "bold"), bg=root["bg"], fg="#2c3e50")
title_label.pack(pady=10)

# Input Frame
frame = tk.Frame(root, bg=root["bg"])
frame.pack(pady=10)

city_label = tk.Label(frame, text="Enter City:", font=("Helvetica", 12), bg=root["bg"])
city_label.grid(row=0, column=0, padx=5, pady=5)

city_entry = ttk.Entry(frame, width=25, font=("Helvetica", 12))
city_entry.grid(row=0, column=1, padx=5, pady=5)
city_entry.focus()

# Button
get_weather_btn = ttk.Button(root, text="Get Weather", command=get_weather)
get_weather_btn.pack(pady=10)

# Weather Icon
weather_icon_label = tk.Label(root, bg=root["bg"])
weather_icon_label.pack(pady=5)

# Result Label
result_label = tk.Label(root, text="", font=("Helvetica", 12), bg=root["bg"], justify="left")
result_label.pack(pady=10)

root.mainloop()
