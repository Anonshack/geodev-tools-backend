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

