import React, { createContext, useContext, useState, useEffect } from "react";
import { useAccount } from "./AccountManager";
import { useIterationMonitor } from "./IterationMonitor";

interface BillItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

interface Bill {
  id: string;
  billNumber: number;
  date: string;
  customerName: string;
  items: BillItem[];
  subTotal: number;
  expectedTotal: number;
  paymentMode: "Cash" | "GPay" | "Bank";
  status: "draft" | "generated";
  difference: number;
  tolerance: number;
  headerInfo: {
    agencyName: string;
    address: string;
  };
  footerInfo: {
    declaration: string;
    signature?: string;
  };
}

interface BillContextType {
  bills: Bill[];
  addBill: (bill: Bill) => void;
  updateBill: (
    id: string,
    bill: Partial<Bill>,
    stockCallbacks?: {
      restoreStock: (id: number, quantity: number) => boolean;
      reduceStock: (id: number, quantity: number) => boolean;
      adjustStock: (id: number, quantityDifference: number) => boolean;
    },
  ) => void;
  deleteBill: (
    id: string,
    stockCallbacks?: {
      restoreStock: (id: number, quantity: number) => boolean;
    },
  ) => void;
  generateBillsFromTransactions: (
    transactions: any[],
    startingBillNumber: number,
    blockedNumbers: number[],
    availableStock?: any[],
    reduceStockCallback?: (id: number, quantity: number) => boolean,
  ) => Promise<Bill[]>;
  deleteAllBills: () => void;
}

const BillContext = createContext<BillContextType | null>(null);

export function BillProvider({ children }: { children: React.ReactNode }) {
  const { activeAccount } = useAccount();
  const iterationMonitor = useIterationMonitor();

  // Initialize with empty array and load data in useEffect
  const [bills, setBills] = useState<Bill[]>([]);

  // Save to account-specific localStorage whenever bills or activeAccount changes
  useEffect(() => {
    try {
      if (activeAccount) {
        const storageKey = `bills_${activeAccount.id}`;
        localStorage.setItem(storageKey, JSON.stringify(bills));
      }
    } catch (error) {
      console.warn("Failed to save bills to localStorage:", error);
    }
  }, [bills, activeAccount]);

  // Load bills for active account (both initial load and account switch)
  useEffect(() => {
    if (activeAccount) {
      try {
        const storageKey = `bills_${activeAccount.id}`;
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsedBills = JSON.parse(saved);
          // Ensure we have valid bill data
          if (Array.isArray(parsedBills)) {
            setBills(parsedBills);
            console.log(
              `Loaded ${parsedBills.length} bills for account ${activeAccount.name}`,
            );
          } else {
            console.warn("Invalid bills data found, starting with empty array");
            setBills([]);
          }
        } else {
          console.log(
            `No saved bills found for account ${activeAccount.name}, starting with empty array`,
          );
          setBills([]);
        }
      } catch (error) {
        console.error("Error loading bills:", error);
        setBills([]);
      }
    } else {
      // If no active account, start with empty array
      setBills([]);
    }
  }, [activeAccount?.id]);

  // Listen for account switch events to force refresh
  useEffect(() => {
    const handleAccountSwitch = () => {
      console.log(
        "Account switch event detected in BillContext, forcing data refresh",
      );
      if (activeAccount) {
        loadAccountData(activeAccount.id);
      }
    };

    const handleForceSave = (event: any) => {
      const accountId = event.detail?.accountId;
      if (accountId && bills.length > 0) {
        try {
          const storageKey = `bills_${accountId}`;
          localStorage.setItem(storageKey, JSON.stringify(bills));
          console.log(
            `Force saved ${bills.length} bills for account ${accountId}`,
          );
        } catch (error) {
          console.error("Error force saving bills:", error);
        }
      }
    };

    const handleLoadAccountData = (event: any) => {
      const accountId = event.detail?.accountId;
      if (accountId) {
        loadAccountData(accountId);
      }
    };

    const loadAccountData = (accountId: string) => {
      try {
        const storageKey = `bills_${accountId}`;
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsedBills = JSON.parse(saved);
          if (Array.isArray(parsedBills)) {
            setBills([...parsedBills]); // Create new array reference to force re-render
            console.log(
              `Force reloaded ${parsedBills.length} bills for account ${accountId}`,
            );
          }
        } else {
          setBills([]);
          console.log(
            `No bills found for account ${accountId}, starting with empty array`,
          );
        }
      } catch (error) {
        console.error("Error force reloading bills:", error);
        setBills([]);
      }
    };

    window.addEventListener("account-switched", handleAccountSwitch);
    window.addEventListener("force-save-account-data", handleForceSave);
    window.addEventListener("load-account-data", handleLoadAccountData);

    return () => {
      window.removeEventListener("account-switched", handleAccountSwitch);
      window.removeEventListener("force-save-account-data", handleForceSave);
      window.removeEventListener("load-account-data", handleLoadAccountData);
    };
  }, [activeAccount, bills]);

  const addBill = (bill: Bill) => {
    setBills((prev) => [...prev, bill]);
  };

  const updateBill = (
    id: string,
    billData: Partial<Bill>,
    stockCallbacks?: {
      restoreStock: (id: number, quantity: number) => boolean;
      reduceStock: (id: number, quantity: number) => boolean;
      adjustStock: (id: number, quantityDifference: number) => boolean;
    },
  ) => {
    // Find the original bill to compare stock changes
    const originalBill = bills.find((bill) => bill.id === id);

    setBills((prev) =>
      prev.map((bill) => (bill.id === id ? { ...bill, ...billData } : bill)),
    );

    // If items have changed and stock callbacks are provided, adjust stock
    if (originalBill && billData.items && stockCallbacks) {
      const originalItems = originalBill.items;
      const newItems = billData.items;

      // Create maps for easier comparison
      const originalItemMap = new Map();
      originalItems.forEach((item) => {
        originalItemMap.set(item.id, item.quantity);
      });

      const newItemMap = new Map();
      newItems.forEach((item) => {
        newItemMap.set(item.id, item.quantity);
      });

      // Check for quantity changes
      originalItems.forEach((originalItem) => {
        const newQuantity = newItemMap.get(originalItem.id) || 0;
        const quantityDifference = originalItem.quantity - newQuantity;

        if (quantityDifference !== 0) {
          // Positive difference means we need to restore stock
          // Negative difference means we need to reduce more stock
          stockCallbacks.adjustStock(originalItem.id, quantityDifference);
          console.log(
            `Adjusted stock for ${originalItem.name}: ${quantityDifference > 0 ? "+" : ""}${quantityDifference}`,
          );
        }
      });

      // Check for new items added
      newItems.forEach((newItem) => {
        if (!originalItemMap.has(newItem.id)) {
          // This is a new item, reduce stock
          stockCallbacks.reduceStock(newItem.id, newItem.quantity);
          console.log(
            `Reduced stock for new item ${newItem.name}: -${newItem.quantity}`,
          );
        }
      });

      // Check for items removed
      originalItems.forEach((originalItem) => {
        if (!newItemMap.has(originalItem.id)) {
          // This item was removed, restore stock
          stockCallbacks.restoreStock(originalItem.id, originalItem.quantity);
          console.log(
            `Restored stock for removed item ${originalItem.name}: +${originalItem.quantity}`,
          );
        }
      });
    }
  };

  const deleteBill = (
    id: string,
    stockCallbacks?: {
      restoreStock: (id: number, quantity: number) => boolean;
    },
  ) => {
    // Find the bill being deleted to restore its stock
    const billToDelete = bills.find((bill) => bill.id === id);

    if (billToDelete && stockCallbacks?.restoreStock) {
      // Restore stock for all items in the bill
      billToDelete.items.forEach((item) => {
        const success = stockCallbacks.restoreStock(item.id, item.quantity);
        if (success) {
          console.log(`Restored stock for ${item.name}: +${item.quantity}`);
        } else {
          console.warn(`Failed to restore stock for ${item.name}`);
        }
      });
    }

    setBills((prev) => prev.filter((bill) => bill.id !== id));
  };

  const deleteAllBills = () => {
    setBills([]);
  };

  // Function to adjust bill after initial generation to match exact target
  const adjustBillToMatchTarget = (
    initialBill: { items: BillItem[]; total: number },
    targetTotal: number,
    availableItems: any[],
  ): { items: BillItem[]; total: number } | null => {
    let adjustedItems = [...initialBill.items];
    let currentTotal = initialBill.total;
    const difference = targetTotal - currentTotal;

    // If already matching or very close, return as is
    if (Math.abs(difference) <= 0) {
      return initialBill;
    }

    console.log(
      `Adjusting bill: Current ₹${currentTotal}, Target ₹${targetTotal}, Difference ₹${difference}`,
    );

    // Case 1: Total is LESS than target - ADD items to increase
    if (difference > 0) {
      console.log(`Under target by ���${difference}, adding items...`);

      // Get available items not already in bill
      const unusedItems = availableItems.filter(
        (item) => !adjustedItems.some((selected) => selected.id === item.id),
      );

      // Sort by price for flexibility
      const sortedUnused = unusedItems.sort((a, b) => a.price - b.price);

      for (const item of sortedUnused) {
        if (currentTotal >= targetTotal) break; // Stop if we've reached target

        // Calculate how many units we need
        const remainingDifference = targetTotal - currentTotal;
        let qtyToAdd = Math.ceil(remainingDifference / item.price);

        // Don't exceed available quantity
        qtyToAdd = Math.min(qtyToAdd, item.availableQuantity);

        if (qtyToAdd > 0) {
          const itemCost = item.price * qtyToAdd;

          // Check if adding this item overshoots too much
          if (currentTotal + itemCost <= targetTotal + 20) {
            // Allow up to ₹20 overshoot
            const billItem: BillItem = {
              id: item.id,
              name: item.name,
              price: item.price,
              quantity: qtyToAdd,
              total: itemCost,
            };

            adjustedItems.push(billItem);
            currentTotal += itemCost;
            console.log(
              `Added ${item.name} (qty: ${qtyToAdd}) for ₹${itemCost}, total now ₹${currentTotal}`,
            );
          } else {
            // Try adding just 1 unit if it doesn't overshoot too much
            const singleItemCost = item.price;
            if (currentTotal + singleItemCost <= targetTotal + 20) {
              const billItem: BillItem = {
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: 1,
                total: singleItemCost,
              };

              adjustedItems.push(billItem);
              currentTotal += singleItemCost;
              console.log(
                `Added ${item.name} (qty: 1) for ₹${singleItemCost}, total now ₹${currentTotal}`,
              );
            }
          }
        }
      }
    }

    // Case 2: Total is MORE than target - REDUCE or REMOVE items
    else if (difference < 0) {
      console.log(
        `Over target by ₹${Math.abs(difference)}, removing/reducing items...`,
      );

      const amountToRemove = Math.abs(difference);

      // Try to reduce quantities first
      for (let i = adjustedItems.length - 1; i >= 0; i--) {
        if (currentTotal <= targetTotal) break;

        const item = adjustedItems[i];
        const remainingOverage = currentTotal - targetTotal;

        // Option 1: Remove the entire item if it fits
        if (currentTotal - item.total >= targetTotal - 20) {
          // Allow up to ₹20 undershoot
          currentTotal -= item.total;
          adjustedItems.splice(i, 1);
          console.log(
            `Removed entire item: ${item.name} (qty: ${item.quantity}), total now ₹${currentTotal}`,
          );
        }
        // Option 2: Reduce quantity
        else if (item.quantity > 1) {
          const qtyToRemove = Math.ceil(remainingOverage / item.price);
          const actualQtyToRemove = Math.min(qtyToRemove, item.quantity - 1); // Keep at least 1 unit

          if (actualQtyToRemove > 0) {
            const removedCost = item.price * actualQtyToRemove;
            item.quantity -= actualQtyToRemove;
            item.total -= removedCost;
            currentTotal -= removedCost;
            console.log(
              `Reduced ${item.name} by ${actualQtyToRemove} units, total now ₹${currentTotal}`,
            );
          }
        }
      }
    }

    // Ensure we still have minimum items
    if (adjustedItems.length === 0) {
      console.log("Adjustment resulted in no items, returning initial bill");
      return initialBill;
    }

    console.log(
      `Adjustment complete: ${adjustedItems.length} items, final total ₹${currentTotal}`,
    );
    return { items: adjustedItems, total: currentTotal };
  };

  // Helper function to yield control to browser periodically using requestAnimationFrame
  const yieldToUI = (): Promise<void> => {
    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        setTimeout(resolve, 0);
      });
    });
  };

  // Enhanced 100,000-iteration algorithm following Python bill generation rules
  const generateOptimalBillItems = async (
    targetTotal: number,
    stockToUse: any[],
    previousItems: string[] = [],
    billNumber?: number,
  ): Promise<{ items: BillItem[]; total: number }> => {
    console.log(
      "Generating optimal bill items for target:",
      targetTotal,
      "Stock available:",
      stockToUse.length,
    );

    // Get available items that aren't in previous bill to avoid repetition
    // Also exclude items with 0 price
    let availableItems = stockToUse.filter(
      (item) =>
        !previousItems.includes(item.name) &&
        item.availableQuantity > 0 &&
        item.price > 0,
    );

    if (availableItems.length < 2) {
      // If not enough unique items available, use all available items with stock and price > 0
      availableItems = stockToUse.filter(
        (item) => item.availableQuantity > 0 && item.price > 0,
      );
      console.log(
        `Not enough unique items (${availableItems.length}), using all available items with stock: ${availableItems.length}`,
      );
    }

    if (availableItems.length === 0) {
      return { items: [], total: 0 };
    }

    let bestMatch: { items: BillItem[]; total: number } | null = null;
    let closestDiff = Infinity;
    const tolerance = 20; // Final difference tolerance ±20
    let iterationsPerformed = 0;

    // Dynamically determine max items based on target total
    let maxItems: number;
    let minItems: number;

    if (targetTotal < 100) {
      // For bills < ₹100, use 1 item
      minItems = 1;
      maxItems = 1;
    } else if (targetTotal < 5000) {
      // For bills ₹100-₹5000, allow 2-7 items
      minItems = 2;
      maxItems = Math.floor(Math.random() * 6) + 2; // Random between 2-7
    } else if (targetTotal <= 9000) {
      // For bills ₹5000-₹9000, minimum 5 items, increase based on amount
      minItems = 5;
      const itemsForAmount = Math.ceil(targetTotal / 1000) + 2; // 1 item per ���1000 + 2
      maxItems = Math.min(itemsForAmount, 10); // Cap at 10
    } else {
      // For bills > ₹9000, minimum 5 items, increase based on amount
      minItems = 5;
      const itemsForAmount = Math.ceil(targetTotal / 1000) + 3; // 1 item per ₹1000 + 3
      maxItems = Math.min(itemsForAmount, 15); // Cap at 15
    }

    // Start iteration monitoring if bill number provided
    let monitorId: string | null = null;
    if (billNumber && iterationMonitor) {
      monitorId = iterationMonitor.startIteration(billNumber, targetTotal);
      iterationMonitor.updateIteration(monitorId, { status: "running" });
      iterationMonitor.logIteration(
        monitorId,
        0,
        `Starting 10,000 iterations for bill ${billNumber} with target ₹${targetTotal}`,
        "info",
      );
    }

    // Complete 10,000 iterations to find the best combination
    for (let attempt = 0; attempt < 10000; attempt++) {
      iterationsPerformed++;

      // Yield to UI every 200 iterations to keep page responsive
      if (attempt % 200 === 0 && attempt > 0) {
        await yieldToUI();
      }

      // Log iteration progress every 2,000 iterations to avoid spam
      if (attempt % 2000 === 0) {
        if (monitorId && iterationMonitor) {
          iterationMonitor.updateIteration(monitorId, {
            currentIteration: attempt + 1,
          });
        }
      }

      // Shuffle items randomly each iteration with price preference for higher targets
      const shuffledItems = [...availableItems];

      // For higher transaction totals, prefer higher-priced items
      if (targetTotal > 5000) {
        // Sort by price descending for high-value transactions
        shuffledItems.sort((a, b) => b.price - a.price);
      } else if (targetTotal > 500) {
        // For medium transactions, slight preference for higher prices but still randomize
        shuffledItems.sort(() => Math.random() - 0.5);
      } else {
        // For small transactions, randomize freely
        shuffledItems.sort(() => Math.random() - 0.5);
      }

      // Apply additional random shuffle to avoid too predictable patterns
      for (let i = shuffledItems.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledItems[i], shuffledItems[j]] = [
          shuffledItems[j],
          shuffledItems[i],
        ];
      }

      const selectedItems: BillItem[] = [];
      let currentTotal = 0;

      let itemsAdded = 0;
      const maxItemsToTry = Math.min(shuffledItems.length, maxItems);

      // Try to select items in shuffled order
      for (
        let itemIndex = 0;
        itemIndex < shuffledItems.length && selectedItems.length < maxItems;
        itemIndex++
      ) {
        const item = shuffledItems[itemIndex];

        // Try different quantities (bounded by available stock and remaining target)
        let bestQty = 0;
        let bestQtyTotal = 0;
        const maxQty = Math.max(
          1,
          Math.min(
            item.availableQuantity,
            Math.ceil((targetTotal - currentTotal) / Math.max(1, item.price)) +
              2,
          ),
        );
        for (let qty = 1; qty <= maxQty; qty++) {
          const itemCost = item.price * qty;
          const newTotal = currentTotal + itemCost;

          // Be more lenient for the first item(s) if we haven't reached minimum items yet
          const currentTolerance =
            selectedItems.length < minItems ? tolerance * 6 : tolerance;

          // Check if this addition keeps us within bounds or gets us closer to target
          if (newTotal <= targetTotal + currentTolerance) {
            bestQty = qty;
            bestQtyTotal = itemCost;
          } else if (
            Math.abs(newTotal - targetTotal) <
            Math.abs(currentTotal - targetTotal)
          ) {
            // Accept this if it gets us closer to the target, even if slightly over tolerance
            bestQty = qty;
            bestQtyTotal = itemCost;
          } else {
            break; // Don't add if it moves us further from target
          }
        }

        // Add the item if we found a valid quantity
        if (bestQty > 0) {
          const billItem: BillItem = {
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: bestQty,
            total: bestQtyTotal,
          };

          selectedItems.push(billItem);
          currentTotal += bestQtyTotal;
          itemsAdded++;
        }
      }

      // If we still don't have minimum items, force add the cheapest available items
      if (selectedItems.length < minItems && shuffledItems.length >= minItems) {
        const remainingItems = shuffledItems.filter(
          (item) => !selectedItems.some((selected) => selected.id === item.id),
        );

        const sortedRemaining = remainingItems.sort(
          (a, b) => a.price - b.price,
        );

        for (const item of sortedRemaining) {
          if (selectedItems.length >= minItems) break;

          const billItem: BillItem = {
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: 1,
            total: item.price,
          };

          selectedItems.push(billItem);
          currentTotal += billItem.total;
        }
      }

      // Enforce minimum items per bill rule
      if (selectedItems.length < minItems) {
        continue; // Skip this combination, try next iteration
      }

      // Calculate difference from target
      const finalDiff = Math.abs(currentTotal - targetTotal);

      // Check if this is our best match so far
      if (finalDiff < closestDiff) {
        bestMatch = { items: [...selectedItems], total: currentTotal };
        closestDiff = finalDiff;

        // Log progress to monitor
        if (monitorId && iterationMonitor) {
          iterationMonitor.updateIteration(monitorId, {
            bestMatch: {
              items: selectedItems,
              total: currentTotal,
              difference: finalDiff,
            },
            currentIteration: attempt + 1,
          });
        }

        // Stop early if perfect match found
        if (finalDiff === 0) {
          console.log(
            `✓ PERFECT MATCH FOUND on iteration ${attempt + 1}! Total: ₹${currentTotal}, difference: ₹0`,
          );
          if (monitorId && iterationMonitor) {
            iterationMonitor.logIteration(
              monitorId,
              attempt + 1,
              `✓ PERFECT MATCH FOUND! Total: ₹${currentTotal}. Stopping iterations.`,
              "success",
            );
          }
          break; // Stop iterations early for perfect match
        } else if (finalDiff <= tolerance && selectedItems.length >= 2) {
          console.log(
            `Good match within ±${tolerance} on iteration ${attempt + 1}: ₹${currentTotal}`,
          );
          if (monitorId && iterationMonitor) {
            iterationMonitor.logIteration(
              monitorId,
              attempt + 1,
              `Good match found! Total: ₹${currentTotal}, difference: ±₹${finalDiff}`,
              "success",
            );
          }
        } else if (attempt % 10000 === 0) {
          // Log progress every 10,000 iterations
          if (monitorId && iterationMonitor) {
            iterationMonitor.logIteration(
              monitorId,
              attempt + 1,
              `Iteration ${(attempt + 1).toLocaleString()}: Best so far ₹${currentTotal} (±₹${finalDiff})`,
              "info",
            );
          }
        }
      } else if (attempt % 20000 === 0 && attempt > 0) {
        // Update progress even when no improvement found
        if (monitorId && iterationMonitor) {
          iterationMonitor.updateIteration(monitorId, {
            currentIteration: attempt + 1,
          });
        }
      }
    }

    // If no acceptable match found, create a fallback with minimum requirements
    if (!bestMatch) {
      console.log(
        `No suitable match found in 200 iterations, creating fallback with minimum ${minItems} items`,
      );

      const selectedItems: BillItem[] = [];
      let currentTotal = 0;

      // Sort items by price and take cheapest items to ensure minimum items requirement
      const sortedItems = availableItems.sort((a, b) => a.price - b.price);

      for (let i = 0; i < Math.min(minItems, sortedItems.length); i++) {
        const item = sortedItems[i];
        const billItem: BillItem = {
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
          total: item.price,
        };
        selectedItems.push(billItem);
        currentTotal += billItem.total;
      }

      bestMatch = { items: selectedItems, total: currentTotal };
      closestDiff = Math.abs(currentTotal - targetTotal);
    } else if (bestMatch.items.length < minItems) {
      // Even if we found a match, ensure it meets minimum items requirement
      console.log(
        `Found match with ${bestMatch.items.length} items, but minimum required is ${minItems}. Trying to add more items...`,
      );

      const remainingItems = availableItems.filter(
        (item) => !bestMatch.items.some((selected) => selected.id === item.id),
      );

      const sortedRemaining = remainingItems.sort((a, b) => a.price - b.price);

      for (const item of sortedRemaining) {
        if (bestMatch.items.length >= minItems) break;

        const billItem: BillItem = {
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
          total: item.price,
        };

        bestMatch.items.push(billItem);
        bestMatch.total += billItem.total;
      }

      closestDiff = Math.abs(bestMatch.total - targetTotal);
    }

    console.log(
      `Bill generation completed after full ${iterationsPerformed} iterations:`,
      `${bestMatch.items.length} items, total: ₹${bestMatch.total},`,
      `target: ₹${targetTotal}, difference: ₹${closestDiff},`,
      `within ±${tolerance}: ${closestDiff <= tolerance}`,
    );

    // Post-generation adjustment: Add or remove items to match exact expected total
    if (bestMatch && Math.abs(bestMatch.total - targetTotal) > 0) {
      console.log(
        `Starting post-generation adjustment. Current: ₹${bestMatch.total}, Target: ₹${targetTotal}`,
      );

      const adjustedBill = adjustBillToMatchTarget(
        bestMatch,
        targetTotal,
        availableItems,
      );

      if (adjustedBill) {
        bestMatch = adjustedBill;
        closestDiff = Math.abs(bestMatch.total - targetTotal);
        console.log(
          `After adjustment: ${bestMatch.items.length} items, total: ₹${bestMatch.total}, difference: ₹${closestDiff}`,
        );

        if (monitorId && iterationMonitor) {
          iterationMonitor.logIteration(
            monitorId,
            100000,
            `Post-adjustment result: ${bestMatch.items.length} items, total: ₹${bestMatch.total}, difference: ₹${closestDiff}`,
            "info",
          );
        }
      }
    }

    // Complete iteration monitoring
    if (monitorId && iterationMonitor) {
      iterationMonitor.completeIteration(monitorId, {
        bestMatch: bestMatch
          ? {
              items: bestMatch.items,
              total: bestMatch.total,
              difference: closestDiff,
            }
          : null,
        currentIteration: 100000,
      });
      iterationMonitor.logIteration(
        monitorId,
        10000,
        `Completed all 10,000 iterations. Final result: ${bestMatch.items.length} items, total: ₹${bestMatch.total}, difference: ₹${closestDiff}`,
        "success",
      );
    }

    // Always return a valid result, even if not perfect
    if (!bestMatch) {
      console.warn(
        `No valid bill items found for target ₹${targetTotal} after all iterations`,
      );
      // Return empty result instead of null
      return { items: [], total: 0 };
    }

    return bestMatch;
  };

  const generateBillsFromTransactions = async (
    transactions: any[],
    startingBillNumber: number,
    blockedNumbers: number[],
    availableStock: any[] = [],
    reduceStockCallback?: (id: number, quantity: number) => boolean,
  ) => {
    const generatedBills: Bill[] = [];
    let currentBillNumber = startingBillNumber;

    // Use provided stock or fallback to mock data, ensure only items with available quantity > 0 and price > 0
    const stockToUse =
      availableStock.length > 0
        ? availableStock
            .filter(
              (item) =>
                item.availableQuantity > 0 &&
                ((item as any).mrp ?? (item as any).price) > 0,
            )
            .map((item) => ({
              id: (item as any).id,
              name: (item as any).itemName,
              price: (item as any).mrp ?? (item as any).price,
              availableQuantity: (item as any).availableQuantity,
            }))
        : [
            { id: 1, name: "Rice (1kg)", price: 80, availableQuantity: 150 },
            {
              id: 2,
              name: "Wheat Flour (1kg)",
              price: 45,
              availableQuantity: 200,
            },
            { id: 3, name: "Sugar (1kg)", price: 60, availableQuantity: 100 },
            {
              id: 4,
              name: "Cooking Oil (1L)",
              price: 120,
              availableQuantity: 80,
            },
            { id: 5, name: "Pulses (1kg)", price: 95, availableQuantity: 120 },
            { id: 6, name: "Tea (250g)", price: 180, availableQuantity: 60 },
            { id: 7, name: "Salt (1kg)", price: 25, availableQuantity: 300 },
          ];

    console.log(
      "Generating bills from transactions:",
      transactions.length,
      "Stock items:",
      stockToUse.length,
    );

    let previousBillItems: string[] = [];
    console.log("Starting main transaction loop...");

    for (let index = 0; index < transactions.length; index++) {
      console.log(`Processing transaction ${index + 1}/${transactions.length}`);
      const transaction = transactions[index];

      // Skip blocked bill numbers - keep incrementing until we find an unblocked number
      while (blockedNumbers.includes(currentBillNumber)) {
        console.log(`Skipping blocked bill number: ${currentBillNumber}`);
        currentBillNumber++;
      }

      console.log(
        `Using bill number: ${currentBillNumber} for transaction ${transaction.id}`,
      );

      // Validate transaction total - must be greater than 0
      const targetTotal =
        typeof transaction.total === "number" ? transaction.total : 0;

      if (targetTotal <= 0) {
        console.warn(
          `Skipping transaction ${transaction.id} - invalid total: ${targetTotal}`,
        );
        continue; // Skip invalid transactions
      }

      console.log(
        `Generating bill ${index + 1}/${transactions.length} (Bill #${currentBillNumber}): target ₹${targetTotal}`,
      );

      // Sequential generation: Keep trying until bill is perfect (within tolerance)
      let selectedItems: BillItem[] = [];
      let currentTotal = 0;
      let generationAttempt = 0;
      const maxGenerationAttempts = 5; // Try up to 5 times per bill (each with 10,000 iterations)
      let billIsPerfect = false;

      while (!billIsPerfect && generationAttempt < maxGenerationAttempts) {
        generationAttempt++;
        console.log(
          `Bill #${currentBillNumber} - Generation attempt ${generationAttempt}/${maxGenerationAttempts}`,
        );

        // Generate bill items using enhanced algorithm
        const result = await generateOptimalBillItems(
          targetTotal,
          stockToUse,
          previousBillItems,
          currentBillNumber,
        );

        selectedItems = result?.items || [];
        currentTotal = result?.total || 0;

        // Check if within tolerance
        const difference = Math.abs(currentTotal - targetTotal);
        if (difference <= 20) {
          billIsPerfect = true;
          console.log(
            `✓ Bill #${currentBillNumber} is PERFECT: ₹${currentTotal} (target ₹${targetTotal}, difference ±${difference})`,
          );
        } else {
          console.log(
            `Bill #${currentBillNumber} needs adjustment: ₹${currentTotal} (target ₹${targetTotal}, difference ±${difference})`,
          );
        }
      }

      // If no items generated, create fallback
      if (selectedItems.length === 0) {
        console.warn(
          `Bill #${currentBillNumber}: No items generated, using fallback`,
        );

        // Get available items with stock and price > 0
        const availableForFallback = stockToUse.filter(
          (item) => item.availableQuantity > 0 && item.price > 0,
        );

        if (availableForFallback.length >= 1) {
          // Sort by price
          const sortedItems = availableForFallback.sort(
            (a, b) => a.price - b.price,
          );

          // Start with cheapest item and add items to reach target
          selectedItems = [];
          currentTotal = 0;

          for (const item of sortedItems) {
            if (currentTotal >= targetTotal) break; // Stop if we've reached target

            const remainingAmount = targetTotal - currentTotal;
            let qtyToAdd = Math.max(1, Math.ceil(remainingAmount / item.price));
            qtyToAdd = Math.min(qtyToAdd, item.availableQuantity);

            const billItem = {
              id: item.id,
              name: item.name,
              price: item.price,
              quantity: qtyToAdd,
              total: item.price * qtyToAdd,
            };
            selectedItems.push(billItem);
            currentTotal += billItem.total;
          }
        } else {
          console.error(
            `Bill #${currentBillNumber}: No available stock items for fallback`,
          );
          // Skip this bill if no stock available
          continue;
        }
      }

      // Final check and adjustment if still not perfect
      let finalDifference = Math.abs(currentTotal - targetTotal);
      if (finalDifference > 20) {
        console.log(
          `Bill #${currentBillNumber} still needs adjustment: difference ±${finalDifference}`,
        );

        // Use the adjustment function as final resort
        const adjustmentResult = adjustBillToMatchTarget(
          { items: selectedItems, total: currentTotal },
          targetTotal,
          stockToUse,
        );

        if (adjustmentResult && adjustmentResult.total !== currentTotal) {
          selectedItems = adjustmentResult.items;
          currentTotal = adjustmentResult.total;
          finalDifference = Math.abs(currentTotal - targetTotal);
          console.log(
            `Bill #${currentBillNumber} after adjustment: ₹${currentTotal} (difference ±${finalDifference})`,
          );
        }
      }

      const bill: Bill = {
        id: `BILL-${currentBillNumber}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        billNumber: currentBillNumber,
        date: transaction.date,
        customerName: transaction.customerName,
        items: selectedItems,
        subTotal: currentTotal,
        expectedTotal: targetTotal,
        paymentMode: transaction.paymentMode,
        status: finalDifference <= 20 ? "generated" : "needs_review",
        difference: targetTotal - currentTotal,
        tolerance: finalDifference,
        headerInfo: {
          agencyName: "Sadhana Agency",
          address: "Harsila (Dewalchaura), Bageshwar, Uttarakhand",
        },
        footerInfo: {
          declaration:
            "We hereby declare that the tax on supplies has been paid by us under the composition scheme.",
          signature: "Authorized Signature",
        },
      };

      generatedBills.push(bill);

      // Always reduce stock quantities when generating bills
      if (reduceStockCallback) {
        selectedItems.forEach((billItem) => {
          const success = reduceStockCallback(billItem.id, billItem.quantity);
          if (success) {
            console.log(
              `Reduced stock for ${billItem.name}: -${billItem.quantity}`,
            );
            // Update available quantity in stockToUse for subsequent bills
            const stockItem = stockToUse.find(
              (item) => item.id === billItem.id,
            );
            if (stockItem) {
              stockItem.availableQuantity = Math.max(
                0,
                stockItem.availableQuantity - billItem.quantity,
              );
            }
          } else {
            console.warn(`Failed to reduce stock for ${billItem.name}`);
          }
        });
      } else {
        // Log warning if no callback provided
        console.warn(
          "No stock reduction callback provided - stock quantities will not be updated",
        );
      }

      // Update previous items for next bill to avoid consecutive repeats
      previousBillItems = selectedItems.map((item) => item.name);

      console.log(
        `Generated bill ${currentBillNumber} with ${selectedItems.length} items, total: ${currentTotal}`,
      );

      // Increment to next bill number for next iteration
      currentBillNumber++;

      // Skip any immediately following blocked numbers for next bill
      while (blockedNumbers.includes(currentBillNumber)) {
        console.log(`Pre-skipping blocked bill number: ${currentBillNumber}`);
        currentBillNumber++;
      }
    }

    console.log("Generated", generatedBills.length, "bills total");
    console.log("Updating bills state...");
    setBills((prev) => [...prev, ...generatedBills]);
    console.log("Bill generation complete, returning array");
    return generatedBills;
  };

  return (
    <BillContext.Provider
      value={{
        bills,
        addBill,
        updateBill,
        deleteBill,
        generateBillsFromTransactions,
        deleteAllBills,
      }}
    >
      {children}
    </BillContext.Provider>
  );
}

export function useBill() {
  const context = useContext(BillContext);
  if (!context) {
    throw new Error("useBill must be used within BillProvider");
  }
  return context;
}
