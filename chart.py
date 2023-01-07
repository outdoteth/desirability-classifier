import matplotlib.pyplot as plt
import json

def plot_spicyest_weights():
    with open("./weightings/azuki/spicyest.json") as json_file:
        weights = [weight for weight in json.load(json_file).values()]
        plt.scatter(x=[idx for idx, x in enumerate(weights)], y=[x for x in weights])
        plt.title("Azuki weights using spicyest")
        plt.xlabel("Token ID")
        plt.ylabel("Weight")
        plt.show()

def plot_spicyest_mids():
    with open("./weightings/azuki/spicyest.json") as weights_json_file:
        weights = [weight for weight in json.load(weights_json_file).values() if weight > 0.98 and weight < 1.5]
        print( len(weights))
        plt.scatter(x=[idx for idx, x in enumerate(weights)], y=[x for x in weights])
        plt.title("Azuki mids using spicyest")
        plt.axhline(y=0.98, color='red', linestyle='-', label="lower bound (0.98")
        plt.axhline(y=1.5, color='black', linestyle='-', label="upper bound (1.5)")
        plt.xlabel("Token ID")
        plt.ylabel("Weight")
        plt.legend()
        plt.show()

def plot_upshot_against_spicyest():
    with open("./weightings/azuki/spicyest.json") as weights_json_file:
        tokenIds = [tokenId for (tokenId, weight) in json.load(weights_json_file).items() if weight > 0.98 and weight < 1.5]

        with open("./weightings/azuki/upshot.json") as upshot_weights_file:
            weights = [weight for (tokenId, weight) in json.load(upshot_weights_file).items() if tokenId in tokenIds]

            plt.scatter(x=[idx for idx, x in enumerate(weights)], y=[x for x in weights])
            plt.title("Mid bucket weights according to upshot")
            plt.xlabel("Index")
            plt.ylabel("Weight")
            plt.axhline(y=0.98, color='red', linestyle='-', label="lower bound (0.98")
            plt.axhline(y=1.5, color='black', linestyle='-', label="upper bound (1.5)")
            plt.legend(loc="upper right")
            plt.show()

def plot_upshot_against_final():
    with open("./bins/mid/azuki.json") as token_ids_json_file:
        tokenIds = [x for x in json.load(token_ids_json_file)["safeTokenIds"]]

        with open("./weightings/azuki/spicyest.json") as upshot_weights_file:
            weights = [weight for (tokenId, weight) in json.load(upshot_weights_file).items() if tokenId in tokenIds]

            plt.scatter(x=[idx for idx, x in enumerate(weights)], y=[x for x in weights])
            plt.title("Final mid bucket weights according to spicyest")
            plt.xlabel("Index")
            plt.ylabel("Weight")
            plt.axhline(y=0.98, color='red', linestyle='-', label="lower bound (0.98")
            plt.axhline(y=1.5, color='black', linestyle='-', label="upper bound (1.5)")
            plt.legend()
            plt.show()

# plot_spicyest_weights()
# plot_spicyest_mids()
plot_upshot_against_spicyest()
# plot_upshot_against_final()