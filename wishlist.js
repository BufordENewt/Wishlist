(function()
{
	"use strict";
	
	angular.module("wishlist", ["ui.sortable"]);
	
	angular.module("wishlist").controller("WishlistController", WishlistController);
	
	WishlistController.$inject = ["$filter", "$window", "$location"];
	
	function WishlistController($filter, $window, $location)
	{
		var vm = this;
		vm.lists = undefined;
		vm.currentList = undefined;
		vm.dialogModel = undefined;
		vm.sortableOptions = {
			cursor: "grabbing",
			handle: ".dragHandle",
			stop: saveLists 
		};
		
		vm.cancelItem = cancelItem;
		vm.commitItem = commitItem;
		vm.deleteItem = deleteItem;
		vm.deleteList = deleteList;
		vm.editItem = editItem;
		vm.moveItem = moveItem;
		vm.newItem = newItem;
		vm.newList = newList;
		vm.saveLists = saveLists;
		vm.selectList = selectList;
		vm.undeleteItem = undeleteItem;
		
		init();
		
		function cancelItem()
		{
			vm.dialogModel = null;
		}
		
		function commitItem()
		{
			var item = vm.dialogModel.editItem || {};
			item.name = vm.dialogModel.name;
			item.url = vm.dialogModel.url;
			item.price = vm.dialogModel.price;
			item.image = vm.dialogModel.image;
			item.website = new URL(vm.dialogModel.url, $window.location).hostname;
			item.comments = vm.dialogModel.comments;
			if (vm.dialogModel.action == "Add")
			{
				if (vm.dialogModel.wishlist)
				{
					selectList(vm.dialogModel.wishlist);
				}
				vm.currentList.items.unshift(item);
			}
			saveLists();
			$("#itemModal").modal("hide");
			vm.dialogModel = null;
		}
		
		function deleteItem(item)
		{
			item.deleted = true;
			vm.saveLists();
		}
		
		function deleteList()
		{
			if (vm.currentList == null || vm.currentList.length == 0 || !confirm("Are you sure you want to delete \"" + vm.currentList.name + "\"?"))
			{
				return;
			}
			var index = vm.lists.findIndex(function(list) { return list.name == vm.currentList.name; });
			vm.lists.splice(index, 1);
			saveLists();
			if (vm.lists.length == 0)
			{
				selectList(null);
			}
			else
			{
				if (index >= vm.lists.length)
				{
					index--;
				}
				selectList(vm.lists[index]);
			}
		}
		
		function editItem(item)
		{
			vm.dialogModel = {
				action: "Edit",
				name: item.name,
				url: item.url,
				price: item.price,
				image: item.image,
				comments: item.comments,
				editItem: item
			};
			$("#itemModal").modal("show");
		}
		
		function init()
		{
			loadLists();
			$("#itemModal").modal({
				keyboard: false,
				show: false,
				backdrop: "static"
			});
			var addParams = $location.search();
			console.log(angular.toJson(addParams));
		}
		
		function loadLists()
		{
			vm.lists = angular.fromJson($window.localStorage.getItem("lists")) || [];
			vm.lists.forEach(function(list) {
				for (var i = list.items.length - 1; i >= 0; i--)
				{
					if (list.items[i].deleted)
					{
						list.items.splice(i, 1);
					}
				}
			});
			var cl = $window.localStorage.getItem("currentList");
			vm.currentList = vm.lists.find(function(item) { return cl == item.name; });
		}
		
		function moveItem(item, list)
		{
			vm.currentList.items.splice(vm.currentList.items.indexOf(item), 1);
			list.items.unshift(item);
			vm.saveLists();
		}
		
		function newItem()
		{
			vm.dialogModel = {
				action: "Add", 
				imageIndex: 0
			};
			$("#itemModal").modal("show");
		}
		
		function newList()
		{
			while (true)
			{
				var listName = $window.prompt("What would you like to name this list?");
				if (listName == null)
				{
					break;
				}
				if (listName != "")
				{
					if (vm.lists.find(function(list) { return list.name == listName; }))
					{
						$window.alert("That list already exists");
					}
					else
					{
						var list = {
							name: listName,
							items: []
						};
						vm.lists.push(list);
						vm.lists = $filter("orderBy")(vm.lists, "name");
						saveLists();
						selectList(list);
						break;
					}
				}
			}
		}
		
		function saveLists()
		{
			$window.localStorage.setItem("lists", angular.toJson(vm.lists, false));
		}
		
		function selectList(list)
		{
			vm.currentList = list;
			if (!list)
			{
				$window.localStorage.removeItem("currentList");
			}
			else
			{
				$window.localStorage.setItem("currentList", list.name);
			}
		}
		
		function undeleteItem(item)
		{
			item.deleted = undefined;
			vm.saveLists();
		}
	}
})();

