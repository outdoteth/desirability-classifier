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
        weights = [weight for weight in json.load(weights_json_file).values()]
        plt.scatter(x=[idx for idx, x in enumerate(weights)], y=[x for x in weights])
        plt.title("Azuki mids using spicyest")
        plt.axhline(y=1.25, color='red', linestyle='-', label="lower bound (1.25")
        plt.axhline(y=2, color='black', linestyle='-', label="upper bound (2.0)")
        plt.xlabel("Token ID")
        plt.ylabel("Weight")
        plt.legend()
        plt.show()

def plot_upshot_against_spicyest():
    with open("./bins/mid/azuki.json") as token_ids_json_file:
        tokenIds = [x for x in json.load(token_ids_json_file)["safeTokenIds"]]

        with open("./weightings/azuki/upshot.json") as upshot_weights_file:
            weights = [weight for (tokenId, weight) in json.load(upshot_weights_file).items() if tokenId in tokenIds]

            plt.scatter(x=[idx for idx, x in enumerate(weights)], y=[x for x in weights])
            plt.title("Mid bucket weights according to upshot")
            plt.xlabel("Index")
            plt.ylabel("Weight")
            plt.axhline(y=1.25, color='red', linestyle='-', label="lower bound (1.25")
            plt.axhline(y=2, color='black', linestyle='-', label="upper bound (2.0)")
            plt.legend()
            plt.show()

def plot_final_bucket_against_spicyest():
    with open("./bins/mid/azuki.json") as token_ids_json_file:
        tokenIds = [x for x in json.load(token_ids_json_file)["safeTokenIds"]]

        with open("./weightings/azuki/nabu.json") as upshot_weights_file:
            weights = [weight for (tokenId, weight) in json.load(upshot_weights_file).items() if tokenId in tokenIds]

            plt.scatter(x=[idx for idx, x in enumerate(weights)], y=[x for x in weights])
            plt.title("Final mid bucket weights according upshot")
            plt.xlabel("Index")
            plt.ylabel("Weight")
            plt.axhline(y=1.25, color='red', linestyle='-', label="lower bound (1.25")
            plt.axhline(y=2, color='black', linestyle='-', label="upper bound (2.0)")
            plt.legend()
            plt.show()

# plot_spicyest_weights()
# plot_spicyest_mids()
# plot_upshot_against_spicyest()
plot_final_bucket_against_spicyest()