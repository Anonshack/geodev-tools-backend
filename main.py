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
while True:
    menu = """
        1) Non
        2) Desert
        3) Exit
    """
    print(menu)

    x = input('Tanlang: ').strip()
    non = {'1': ('Yumshoq-non', 1200), '2': ('Qattiq-non', 1300), '3': ('Qora-non', 1400)}
    desert = {'1': ('Chocolate', 4000), '2': ('Milk', 3000), '3': ('Bruni', 1400)}

    if x == '1':
        print('--- Nonlar ---')
        for k, (name, price) in non.items():
            print(f"{k}) {name} - {price} so'm")

        choice = input('Tanlang (raqam bilan): ').strip()
        if choice in non:
            count = input('Nechta olmoqchisiz?: ')
            if count.isdigit():
                count = int(count)
                name, price = non[choice]
                total = count * price
                print(f"Siz {count} ta {name} oldingiz, umumiy summa: {total} so'm\n")
            else:
                print("Faqat raqam kiriting!\n")
        else:
            print("Xato tanladingiz!\n")

    elif x == '2':
        print('--- Desertlar ---')
        for k, (name, price) in desert.items():
            print(f"{k}) {name} - {price} so'm")

        choice = input('Tanlang (raqam bilan): ').strip()
        if choice in desert:
            count = input('Nechta olmoqchisiz?: ')
            if count.isdigit():
                count = int(count)
                name, price = desert[choice]
                total = count * price
                print(f"Siz {count} ta {name} oldingiz, umumiy summa: {total} so'm\n")
            else:
                print("Faqat raqam kiriting!\n")
        else:
            print("Xato tanladingiz!\n")

    elif x == '3':
        print("Tashakkur! Dastur tugadi.")
        break

    else:
        print("Noto‘g‘ri tanlov, qaytadan urinib ko‘ring.\n")
