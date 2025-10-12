let tests = {
    levelToColour: ()=> {
        let diamondLevelStart = 0;
        let levelColours = ['BRONZE','SILVER','GOLD','PLATINUM','PEARL','DIAMOND'];
        for (let level=0; level<=1200; level+=10) {
            let cI = Clamp(level/100|0,0,levelColours.length-1);
            let colour = levelColours[cI];
            (!diamondLevelStart && colour==='DIAMOND') && (diamondLevelStart = level);
            let cL = Math.ceil(level/10)%10 +1;

            let ext = '';
            if (diamondLevelStart && level>=diamondLevelStart) {
                ext = level - diamondLevelStart;
                ext=ext/100|0;
                ext +=1;
                ext = ` ${ext}`;
            };
            
            console.log(level, `${colour}${ext}`,cL);
        };

        console.log(`DiamondLevel ${diamondLevelStart}`);
    }
};