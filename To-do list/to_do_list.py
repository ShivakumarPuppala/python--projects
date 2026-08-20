tasks=[]

def add_task():
    name=input("Enter task name:")

    task={
        "name":name
    }
    tasks.append(task)
    print("Task added successfully!")


def view_tasks():
    if len(tasks)==0:
        print("No tasks found.")
        return

    print("\n======Tasks=======")

    for i,task in enumerate(tasks,start=1):
        print(f"{i}.{task['name']}")

def delete_task():
    if len(tasks) == 0:
        print("No tasks found.")
        return

    view_tasks()

    try:
        task_number = int(input("Enter the task number to delete: "))
        if task_number < 1 or task_number > len(tasks):
            print("Invalid task number.")
            return
    except ValueError:
        print("Please enter a number.")
        return

    deleted_task = tasks.pop(task_number - 1)
    print(f"Deleted: {deleted_task['name']}")

while True:
    print("\nTo-Do List Menu:")
    print("1. Add Task")
    print("2. View Tasks")
    print("3. Delete Task")
    print("4. Exit")

    choice = input("Enter your choice (1-4): ")

    if choice == '1':
        add_task()
    elif choice == '2':
        view_tasks()
    elif choice == '3':
        delete_task()
    elif choice == '4':
        print("Exiting the program.")
        break
    else:
        print("Invalid choice. Please try again.")