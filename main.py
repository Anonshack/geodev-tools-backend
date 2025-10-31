# import requests
# from json import dump
# from threading import Thread
#
# urls = ["https://dummyjson.com/posts", 'https://dummyjson.com/posts', "https://dummyjson.com/posts"]
#
#
# def download_and_save(url, name):
#     response = requests.get(url)
#     data = response.json()
#     with open(name, "w", encoding="utf-8") as f:
#         dump(data, f, indent=4, ensure_ascii=False)
#
#
# threads = []
# num = 0
#
# for url in urls:
#     num += 1
#     proccess = Thread(target=download_and_save, args=(url, f'file{num}.json'))
#     proccess.start()
#     threads.append(proccess)
# for el in threads:
#     el.join()

gender = input('Enter your gender -> [F/M]: ')
name = input('Enter your name: ')
last_name = input('Enter your last_name: ')
age = int(input('Enter your age: '))
phone_number = input('Enter your phone number: ')
weight = float(input('Enter your weight: '))
height = float(input('Enter your height: '))

if (gender == 'M' or gender == 'm') and age >= 18 and len(phone_number) >= 8 and weight >= 70.5 and height >= 170.1:
    print(f"Congratulation, {name.title() + last_name.title()} you have been registered successfully")
elif (gender == 'F' or gender == 'f') and age >= 19 and len(phone_number) >= 8 and weight >= 60.5 and height >= 160.1:
    print(f"Congratulation, Mrs {name.title()} {last_name.title()} you have been registered successfully")
else:
    print('Sorry!\a')
